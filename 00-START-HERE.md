# Montana Mac BBQ order demo

Cory Skinner's menu. The business folder is `FGA-AIOS/clients/montana-mac-bbq/`. This website folder is the ordering demo.

The GitHub repo name `barbecue-food-restaurant` is the project name. His business name is Montana Mac BBQ.

Public source: https://github.com/thomasg42/barbecue-food-restaurant
Menu, after the publish script: https://thomasg42.github.io/barbecue-food-restaurant/

That public link is the menu from the 2026-11-09 publish, and it still says Corey until Thomas runs the publish script again. On the public link, the order stays on the phone that opened it. The iPad and the kitchen computer share one ticket only while this Mac server is running.

## What he can tap

- Menu shows the photos he sent. Platters from the first batch stay. The new batch is plates, sandwiches, and sides. Every price says **Not set**.
- The bottom bar is **Menu**, **Cory**, and **Cart**. Cory is his story. It is not an order.
- A food tile opens the photo and the ingredients. **Select item** puts it on the cart.
- **Send to register** hands the ticket to the iPad.
- Register at http://127.0.0.1:8791/register is the iPad. **Ring in** fires the ticket. **Mark paid** only records that money was taken outside the app. No card is charged.
- Kitchen at http://127.0.0.1:8791/kitchen is the back-of-house computer. **Bump** clears a plate. **Recall** brings it back. No prices and no payment on that screen.

## Run

```bash
cd "$HOME/Documents/FGA-Brain/FGA-AIOS/clients/montana-mac-bbq/website"
npm test
npm start
```

## Publish

Only when Thomas says `vim up` or `push`:

```bash
bash "$HOME/Documents/FGA-Brain/FGA-AIOS/clients/montana-mac-bbq/website/publish-pages.sh"
```

## Still unconfirmed

Phone, address, hours, prices, and which register he already pays for. One photo was labeled 5 Dollar Special. That is the plate name. The register price is still Not set. The longer article about Cory is for later. No phone number is on the page.
