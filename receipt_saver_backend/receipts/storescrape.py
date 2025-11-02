import re
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from decimal import Decimal

class Scraper:
    def __init__(self, store_name, item_name):
        self.store = store_name
        self.item = item_name
        self.timeout = 30000

    def checkStore(self):
        try:
            if not self.store or not self.item:
                return {"error": "Missing fields to scrape"}
            method = {
                "target": self.scrape_target,
                "walmart": self.scrape_walmart,
                "aldi": self.scrape_aldi,
                "albertsons": self.scrape_albertsons,
                "staterbros": self.scrape_staterbros,
                "sprouts": self.scrape_sprouts,
                "costco": self.scrape_costco,
            }

            if self.store not in method:
                return {"error": "Store not found."}

            return method[self.store]()
        except Exception as e:
            return {"error": str(e)}
        
    def extract_price(self, price_text):
        """Extract numeric price from text"""
        if not price_text:
            return None
        price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
        if price_match:
            return Decimal(price_match.group())
        return None
        
    def scrape_target(self):
        products = []
        search_url = f"https://www.target.com/s?searchTerm={self.item.replace(' ', '+')}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                page.wait_for_selector('[data-test="product-grid"]', timeout=10000)
                
                items = page.query_selector_all('[data-test="@web/site-top-of-funnel/ProductCardWrapper"]')[:10]
                
                for item in items:
                    try:
                        name_el = item.query_selector('[data-test="product-title"]')
                        price_el = item.query_selector('[data-test="current-price"]')
                        link_el = item.query_selector('a')
                        image_el = item.query_selector('img')
                        
                        if name_el and price_el:
                            name = name_el.inner_text().strip()
                            price = self.extract_price(price_el.inner_text())
                            url = f"https://www.target.com{link_el.get_attribute('href')}" if link_el else search_url
                            image_url = image_el.get_attribute('src') if image_el else None
                            
                            products.append({
                                'name': name,
                                'price': price,
                                'url': url,
                                'image_url': image_url,
                                'in_stock': True
                            })
                    except Exception as e:
                        print(f"Error parsing Target item: {e}")
                        continue
                        
            except PlaywrightTimeout:
                return {"error": "Scraping Target timeout exceeded."}
            finally:
                browser.close()
        
        return products
    
    def scrape_walmart(self):
        products = []
        search_url = f"https://www.walmart.com/search?q={self.item.replace(' ', '+')}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                page.wait_for_selector('[data-testid="list-view"]', timeout=10000)
                
                items = page.query_selector_all('[data-item-id]')[:10]
                
                for item in items:
                    try:
                        name_el = item.query_selector('[data-automation-id="product-title"]')
                        price_el = item.query_selector('[data-automation-id="product-price"] span')
                        link_el = item.query_selector('a[link-identifier]')
                        image_el = item.query_selector('img')
                        
                        if name_el and price_el:
                            name = name_el.inner_text().strip()
                            price = self.extract_price(price_el.inner_text())
                            url = f"https://www.walmart.com{link_el.get_attribute('href')}" if link_el else search_url
                            image_url = image_el.get_attribute('src') if image_el else None
                            
                            products.append({
                                'name': name,
                                'price': price,
                                'url': url,
                                'image_url': image_url,
                                'in_stock': True
                            })
                    except Exception as e:
                        print(f"Error parsing Walmart item: {e}")
                        continue
                        
            except PlaywrightTimeout:
                return {"error": "Scraping Walmart timeout exceeded."}
            finally:
                browser.close()
        
        return products
    
    def scrape_aldi(self):
        products = []
        search_url = f"https://www.aldi.us/en/products/search/?q={self.item.replace(' ', '+')}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                page.wait_for_selector('.product-tile', timeout=10000)
                
                items = page.query_selector_all('.product-tile')[:10]
                
                for item in items:
                    try:
                        name_el = item.query_selector('.product-tile__name')
                        price_el = item.query_selector('.product-tile__price')
                        link_el = item.query_selector('a')
                        image_el = item.query_selector('img')
                        
                        if name_el:
                            name = name_el.inner_text().strip()
                            price = self.extract_price(price_el.inner_text()) if price_el else None
                            url = link_el.get_attribute('href') if link_el else search_url
                            image_url = image_el.get_attribute('src') if image_el else None
                            
                            products.append({
                                'name': name,
                                'price': price,
                                'url': url if url.startswith('http') else f"https://www.aldi.us{url}",
                                'image_url': image_url,
                                'in_stock': True
                            })
                    except Exception as e:
                        print(f"Error parsing Aldi item: {e}")
                        continue
                        
            except PlaywrightTimeout:
                return {"error": "Scraping Aldi timeout exceeded."}
            finally:
                browser.close()
        
        return products
    
    def scrape_albertsons(self):
        products = []
        search_url = f"https://www.albertsons.com/shop/search-results.html?q={self.item.replace(' ', '%20')}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                page.wait_for_selector('.product-item', timeout=10000)
                
                items = page.query_selector_all('.product-item')[:10]
                
                for item in items:
                    try:
                        name_el = item.query_selector('.product-title')
                        price_el = item.query_selector('.product-price')
                        link_el = item.query_selector('a.product-link')
                        image_el = item.query_selector('img')
                        
                        if name_el:
                            name = name_el.inner_text().strip()
                            price = self.extract_price(price_el.inner_text()) if price_el else None
                            url = link_el.get_attribute('href') if link_el else search_url
                            image_url = image_el.get_attribute('src') if image_el else None
                            
                            products.append({
                                'name': name,
                                'price': price,
                                'url': url if url.startswith('http') else f"https://www.albertsons.com{url}",
                                'image_url': image_url,
                                'in_stock': True
                            })
                    except Exception as e:
                        print(f"Error parsing Albertsons item: {e}")
                        continue
                        
            except PlaywrightTimeout:
                return {"error": "Scraping Albertsons timeout exceeded."}
            finally:
                browser.close()
        
        return products
    
    def scrape_staterbros(self):
        products = []
        search_url = f"https://www.staterbros.com/search?searchTerm={self.item.replace(' ', '+')}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                page.wait_for_selector('.product-card', timeout=10000)
                
                items = page.query_selector_all('.product-card')[:10]
                
                for item in items:
                    try:
                        name_el = item.query_selector('.product-name')
                        price_el = item.query_selector('.product-price')
                        link_el = item.query_selector('a')
                        image_el = item.query_selector('img')
                        
                        if name_el:
                            name = name_el.inner_text().strip()
                            price = self.extract_price(price_el.inner_text()) if price_el else None
                            url = link_el.get_attribute('href') if link_el else search_url
                            image_url = image_el.get_attribute('src') if image_el else None
                            
                            products.append({
                                'name': name,
                                'price': price,
                                'url': url if url.startswith('http') else f"https://www.staterbros.com{url}",
                                'image_url': image_url,
                                'in_stock': True
                            })
                    except Exception as e:
                        print(f"Error parsing Stater Bros item: {e}")
                        continue
                        
            except PlaywrightTimeout:
                return {"error": "Scraping Stater Bros timeout exceeded."}
            finally:
                browser.close()
        
        return products
    
    def scrape_sprouts(self):
        products = []
        search_url = f"https://shop.sprouts.com/search?search_term={self.item.replace(' ', '%20')}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                page.wait_for_selector('[data-testid="product-tile"]', timeout=10000)
                
                items = page.query_selector_all('[data-testid="product-tile"]')[:10]
                
                for item in items:
                    try:
                        name_el = item.query_selector('[data-testid="product-name"]')
                        price_el = item.query_selector('[data-testid="product-price"]')
                        link_el = item.query_selector('a')
                        image_el = item.query_selector('img')
                        
                        if name_el:
                            name = name_el.inner_text().strip()
                            price = self.extract_price(price_el.inner_text()) if price_el else None
                            url = link_el.get_attribute('href') if link_el else search_url
                            image_url = image_el.get_attribute('src') if image_el else None
                            
                            products.append({
                                'name': name,
                                'price': price,
                                'url': url if url.startswith('http') else f"https://shop.sprouts.com{url}",
                                'image_url': image_url,
                                'in_stock': True
                            })
                    except Exception as e:
                        print(f"Error parsing Sprouts item: {e}")
                        continue
                        
            except PlaywrightTimeout:
                return {"error": "Scraping Sprouts timeout exceeded."}
            finally:
                browser.close()
        
        return products
    
    def scrape_costco(self):
        products = []
        search_url = f"https://www.costco.com/CatalogSearch?keyword={self.item.replace(' ', '+')}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                page.wait_for_selector('.product', timeout=10000)
                
                items = page.query_selector_all('.product')[:10]
                
                for item in items:
                    try:
                        name_el = item.query_selector('.description')
                        price_el = item.query_selector('.price')
                        link_el = item.query_selector('a')
                        image_el = item.query_selector('img')
                        
                        if name_el:
                            name = name_el.inner_text().strip()
                            price = self.extract_price(price_el.inner_text()) if price_el else None
                            url = link_el.get_attribute('href') if link_el else search_url
                            image_url = image_el.get_attribute('src') if image_el else None
                            
                            products.append({
                                'name': name,
                                'price': price,
                                'url': url if url.startswith('http') else f"https://www.costco.com{url}",
                                'image_url': image_url,
                                'in_stock': True
                            })
                    except Exception as e:
                        print(f"Error parsing Costco item: {e}")
                        continue
                        
            except PlaywrightTimeout:
                return {"error": "Scraping Costco timeout exceeded."}
            finally:
                browser.close()
        
        return products
