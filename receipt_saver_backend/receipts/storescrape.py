import requests
from bs4 import BeautifulSoup

{
    "productName": "",
    "productLink": "",
    "price": 1,
    "imgURL": "",
    "rating": 0,
    "reviewsAmount": 0,
}



class Scraper:
    def __init__(self, store_name, item_name):
        self.store = store_name
        self.item = item_name
        

    def checkStore(self):
        try:
            print(self.store)
            print(self.item)
            if not self.store or not self.item:
                return {"error": "Missing fields to scrape"}
            method = {
                "target": self.scrape_target,
                "walmart": self.scrape_walmart,
                "aldi": self.scrape_aldi,
                "albertsons": self.scrape_albertsons,
                "staterbros": self.scrape_staterbros,
                "sprouts": self.scrape_sprouts
            }

            if self.store not in method:
                return {"error": "Store not found."}

            return method[self.store](self.item)
        except Exception as e:
            return {"error": str(e)}

    def scrape_target(self, item_name):
        try:
            url = f"https://target.com/s?searchTerm={item_name}"

            response = requests.get(url=url)

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                soup.select('div[data-test="product-grid"]')
                return {"cane": "tray"}

            return {"error": "Retrieving data from Target resulted in invalid status code."}
        except:
            return {"error": "Error when retrieving data from Target"}

    def scrape_walmart(self, item_name):
        pass

    def scrape_aldi(self, item_name):
        pass

    def scrape_albertsons(self, item_name):
        pass

    def scrape_staterbros(self, item_name):
        pass

    def scrape_sprouts(self, item_name):
        pass

