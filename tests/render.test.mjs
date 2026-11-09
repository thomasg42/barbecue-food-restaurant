import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { createServer } from 'vite'

const root = new URL('..', import.meta.url)

test('the menu file has no prices and the photos are the ones he sent', () => {
  const menu = readFileSync(new URL('../src/data/menu.ts', import.meta.url), 'utf8')
  assert.match(menu, /Not set/)
  assert.doesNotMatch(menu, /\$\d/)
  assert.doesNotMatch(menu, /price\s*:/i)
  assert.doesNotMatch(menu, /Noodles|Smokestack|Toast|Square/)
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /height:\s*100dvh/)
  assert.match(css, /flex-wrap:\s*wrap/)
  assert.doesNotMatch(css, /position:\s*sticky/)
  for (const name of ['chips-salsa.jpg', 'ham-board.jpg', 'fruit-tray.jpg']) {
    const file = new URL(`../public/photos/${name}`, import.meta.url)
    assert.ok(statSync(file).size > 1000, name)
  }
})

test('the screens show the order path and no confirmed price', { timeout: 60000 }, async () => {
  const vite = await createServer({
    root: root.pathname,
    configFile: new URL('../vite.config.ts', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const station = await vite.ssrLoadModule('/src/station.ts')
    assert.equal(station.stationFromPath('/register'), 'register')
    assert.equal(station.stationFromPath('/barbecue-food-restaurant/register'), 'register')
    assert.equal(station.stationFromPath('/barbecue-food-restaurant/kitchen/'), 'kitchen')
    assert.equal(station.stationFromPath('/'), 'guest')
    assert.equal(station.stationHref('register'), '/register')
    const preview = await vite.ssrLoadModule('/src/ssrPreview.tsx')
    const guest = preview.guestHtml()
    const register = preview.registerHtml()
    const kitchen = preview.kitchenHtml()
    assert.match(guest, /Select item/)
    assert.match(guest, /Not set/)
    assert.match(guest, /Name not in yet/)
    assert.match(guest, /Chips and salsa platter/)
    assert.match(guest, /Corn chips/)
    assert.match(guest, /Sample plate\. Not from his kitchen\./)
    assert.match(guest, /Sauce on the side/)
    assert.match(guest, /Send to register/)
    assert.match(guest, /Menu/)
    assert.match(guest, /Cart<span/)
    assert.match(register, /Ring in/)
    assert.match(register, /Mark paid/)
    assert.match(register, /No card is charged/)
    assert.match(register, /Patio/)
    assert.match(kitchen, /Bump/)
    assert.match(kitchen, /Ribs/)
    assert.match(kitchen, /Bar/)
    assert.doesNotMatch(kitchen, /Mark paid|Not set|Ring in/)
    for (const html of [guest, register, kitchen]) {
      assert.doesNotMatch(html, /\$\d/)
      assert.doesNotMatch(html, /Noodles|Smokestack/)
    }
  } finally {
    await vite.close()
  }
})
