# Barbecue order demo

FGA-owned demo for a barbecue prospect. He sent three photos and no business name. This is not a client folder. When he sends the public name, move this folder to `FGA-AIOS/clients/<his-business>/` and do not leave a copy here.

The GitHub repo name `barbecue-food-restaurant` is only the project name. It is not his business name.

Public source: https://github.com/thomasg42/barbecue-food-restaurant
Menu, after the publish script: https://thomasg42.github.io/barbecue-food-restaurant/

On that public link, the order stays on the phone that opened it. The iPad and the kitchen computer share one ticket only while this Mac server is running.

Do not publish it. Do not add it to the Command Center. Do not put it in the ownership registry. GitHub Pages cannot run the ticket server.

## What he can tap

- Menu at http://127.0.0.1:8791/ shows the three photos plus sample Southern plates. Sample plates say they are not from his kitchen. Every price says **Not set**.
- A tile opens the photo and the ingredients. **Select item** puts it on the cart.
- The bottom bar is **Menu** and **Cart**. **Send to register** hands the ticket to the iPad.
- Register at http://127.0.0.1:8791/register is the iPad. **Ring in** fires the ticket. **Mark paid** only records that money was taken outside the app. No card is charged.
- Kitchen at http://127.0.0.1:8791/kitchen is the back-of-house computer. It shows fired tickets, oldest first. **Bump** clears a plate. **Recall** brings it back. No prices and no payment on that screen.

The phone, the iPad, and the kitchen computer have to be on the same Wi-Fi as this Mac. The server prints the network address when it starts. If the Wi-Fi blips, the device keeps the ticket and retries.

## Run

```bash
cd "$HOME/Documents/FGA-Brain/FGA-AIOS/forever-gold-agency/forever-gold-ai/demos/bbq-order"
npm install
npm test
npm start
```

## Still unconfirmed

Business name, phone, address, hours, prices, his real plate list, and which register he already pays for. None of those are in this demo.
