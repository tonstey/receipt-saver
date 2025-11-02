import requests
import json
import re
import uuid

from decouple import config
from PIL import Image
from io import BytesIO
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from .models import CustomUser, Receipt, Item

def verifyPassword(password:str) -> bool:
    if len(password) < 8 or len(password) > 100:
        return False, "Password is not between 8 and 100 characters long."
    
    # At least 1 Space
    if re.search(r"\s", password):
        return False, "Password contains a space character."

    # At least 1 Uppercase
    if not re.search(r"[A-Z]", password):
        return False, "Password is missing an uppercase letter."
    
    # At least 1 Lowercase
    if not re.search(r"[a-z]", password):
        return False, "Password is missing a lowercase letter."
    
    # At least 1 Digit
    if not re.search(r"\d", password):
        return False, "Password is missing a digit."
    
    # At least 1 Special Character
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", password):
        return False, "Password is missing a special character."

    return True, "Strong password"

def read_receipt(file):
    try:
        image = Image.open(file)
        if image.mode == "RGBA":
            image = image.convert("RGB")

        buffer = BytesIO()
        image.save(buffer, format="JPEG")
        buffer.seek(0)

        api_key = config("OCR_API")
        payload = {
                'apikey': api_key,
                'language': "eng",
                'isTable': True,
                }
    
        r = requests.post('https://api.ocr.space/parse/image',
                            files={'file': buffer},
                            data=payload, timeout=30
                            )
        
        content = json.loads(r.content.decode())
        print(content)
        if content['OCRExitCode'] == 1 or content['OCRExitCode'] == 2:
            lines = []
            try:
                for line in content['ParsedResults'][0]['TextOverlay']['Lines']:
                    lines.append(line['LineText'])
                return {"success": True, "data": lines}
            except:
                return {"success": False, "message": "Lines do not exist in image."}
        else:
            return {"success": False, "message": content.get('ErrorMessage', 'Unknown error')}
    
    except requests.exceptions.Timeout:
        return {"success": False, "message" : "OCR request timed out"}
    except requests.exceptions.RequestException as e:
        print(str(e))
        return {"success": False, "message": "There was an error in the OCR API."}
    except Exception as e:
        # catch Pillow or any other error
        print("Unexpected error in read_receipt:", str(e))
        return {"success": False, "message": "Error while reading receipt."}
    
class ReceiptParser:
    
    def __init__(self):
        # Common patterns for receipt parsing
        self.date_patterns = [
            r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b',
            r'\b(\d{1,2}/\d{1,2}/\d{2,4})\b',
            r'\b(\d{1,2}-\d{1,2}-\d{2,4})\b',
            r'\b(\d{4}-\d{1,2}-\d{1,2})\b',
            r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b'
        ]
        
        # Price patterns (with optional quantity)
        self.item_patterns = [
            r'^(.+?)\s+(\d+)\s*x?\s*\$?(\d+\.\d{2})\s*$',  # Item name, quantity, price
            r'^(.+?)\s+\$?(\d+\.\d{2})\s*$',  # Item name, price (quantity = 1)
            r'^(\d+)\s*x\s*(.+?)\s+\$?(\d+\.\d{2})\s*$',  # Quantity, item name, price
        ]
        
        # Words that  indicate non-item lines
        self.skip_words = {
            'total', 'subtotal', 'tax', 'change', 'cash', 'card', 'credit', 'debit',
            'discount', 'coupon', 'thank', 'visit', 'receipt', 'phone', 'store',
            'address', 'manager', 'cashier', 'transaction', 'balance'
        }

    def extract_store_name(self, lines:List[str]) -> str:
       
        for line in lines[:5]:
            line = line.strip()
            if line and len(line) > 2 and not re.match(r'^\d+$', line):
                # Skip lines that are just numbers or addresses
                if not re.search(r'\d{3,}.*\d{3,}', line):  # Skip phone numbers
                    if not re.search(r'\d+.*[a-zA-Z]+.*\d+', line):  # Skip address-like lines
                        return line
        return "Unnamed Store"

    def extract_address(self, lines:List[str]) -> str:
        address_parts = []
        
        for line in lines[:10] :  
            line = line.strip()
            # Look for address patterns
            if re.search(r'\d+.*[a-zA-Z].*(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive)', line, re.IGNORECASE):
                address_parts.append(line)
            elif re.search(r'[a-zA-Z]+,\s*[A-Z]{2}\s*\d{5}', line):  # City, State ZIP
                address_parts.append(line)
        
        return ' '.join(address_parts) if address_parts else "Address not found"

    def extract_date(self, lines:List[str]) -> str:
        text = ' '.join(lines)
        for pattern in self.date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                date_str = matches[0]
                try:
                    # Try to parse and standardize the date
                    if '/' in date_str:
                        parsed_date = datetime.strptime(date_str, '%m/%d/%Y')
                    elif '-' in date_str and len(date_str) == 10:
                        parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
                    else:
                        # For month names, try different formats
                        for fmt in ['%b %d, %Y', '%B %d, %Y', '%b %d %Y', '%B %d %Y']:
                            try:
                                parsed_date = datetime.strptime(date_str, fmt)
                                break
                            except:
                                continue
                        else:
                            return date_str  # Return as-is if can't parse
                    
                    return parsed_date.isoformat()
                except:
                    return date_str
        
        return datetime.now().isoformat()  # Default to current date

    def extract_items(self, lines:List[str]) -> List[Item]:
        items = []
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 3:
                continue
            
            # Skip lines with skip words
            if any(word in line.lower() for word in self.skip_words):
                continue
            
            # Skip header-like lines (all caps, short)
            if line.isupper() and len(line) < 30:
                continue
            
            # Try to match item patterns
            for pattern in self.item_patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match:
                    if len(match.groups()) == 3:
                        # Pattern with quantity
                        if pattern == self.item_patterns[2]:  # Quantity first
                            quantity_str, name, price_str = match.groups()
                            quantity = int(quantity_str)
                        else:  # Name first
                            name, quantity_str, price_str = match.groups()
                            quantity = int(quantity_str)
                    else:
                        # Pattern without explicit quantity
                        name, price_str = match.groups()
                        quantity = 1
                    
                    try:
                        price = float(price_str)
                        item = Item(
                            item_uuid=str(uuid.uuid4()),
                            name=name.strip(),
                            quantity=quantity,
                            price=price
                        )
                        items.append(item)
                        break
                    except ValueError:
                        continue
        
        # If no items found with patterns, try a simpler approach
        if not items:
            items = self._fallback_item_extraction(lines)
        
        return items

    def _fallback_item_extraction(self, lines: List[str]) -> List[Item]:
        items = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Skip obvious non-item lines
            if any(word in line.lower() for word in self.skip_words):
                continue
            
            # Look for any line with a price pattern
            price_match = re.search(r'\$?(\d+\.\d{2})', line)
            if price_match:
                price = float(price_match.group(1))
                # Extract item name (everything before the price)
                name = re.sub(r'\s*\$?\d+\.\d{2}.*$', '', line).strip()
                
                if name and len(name) > 1:
                    # Look for quantity in the name
                    quantity_match = re.search(r'^(\d+)\s*x?\s*', name)
                    if quantity_match:
                        quantity = int(quantity_match.group(1))
                        name = re.sub(r'^\d+\s*x?\s*', '', name).strip()
                    else:
                        quantity = 1
                    
                    item = Item(
                        item_uuid=str(uuid.uuid4()),
                        name=name,
                        quantity=quantity,
                        price=price
                    )
                    items.append(item)
        
        return items
    
    def extract_totals(self, lines:List[str]) -> tuple[Optional[float], Optional[float], Optional[float]]:
        subtotal = 0.0
        tax = 0.0
        total = 0.0
     
        for line in lines:
            line = line.strip().lower()
            
            # Look for subtotal
            if 'subtotal' in line:
                subtotal_match = re.search(r'\$?(\d+\.\d{2})', line)
                if subtotal_match:
                    subtotal += float(subtotal_match.group(1))
            
            # Look for tax
            elif any(tax_word in line for tax_word in ['tax', 'sales tax', 'vat']):
                tax_match = re.search(r'\$?(\d+\.\d{2})', line)
                if tax_match:
                    tax += float(tax_match.group(1))
            
            # Look for total
            elif line.startswith('total') and 'subtotal' not in line:
                total_match = re.search(r'\$?(\d+\.\d{2})', line)
                if total_match:
                    total += float(total_match.group(1))
            
        return subtotal, tax, total
