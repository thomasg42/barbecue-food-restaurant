import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { createServer } from 'vite'

const root = new URL('..', import.meta.url)

test('the menu file has no prices and the photos are the ones he sent', () => {
  const menu = readFileSync(new URL('../src/data/menu.ts', import.meta.url), 'utf8')
  assert.match(menu, /import\.meta\.env\.BASE_URL/)
  assert.match(menu, /photos\/\$\{file\}/)
  assert.match(menu, /photo\('chips-salsa\.jpg'\)/)
  assert.match(menu, /photo\('ham-board\.jpg'\)/)
  assert.match(menu, /photo\('fruit-tray\.jpg'\)/)
  assert.match(menu, /photo\('five-dollar-special\.jpg'\)/)
  assert.match(menu, /photo\('ribs\.jpg'\)/)
  assert.match(menu, /photo\('shrimp-mushrooms\.jpg'\)/)
  assert.match(menu, /photo\('tacos\.jpg'\)/)
  assert.match(menu, /photo\('burritos\.jpg'\)/)
  assert.match(menu, /photo\('roast-beef-subs\.jpg'\)/)
  assert.match(menu, /photo\('ham-subs\.jpg'\)/)
  assert.match(menu, /photo\('tomato-lettuce\.jpg'\)/)
  assert.match(menu, /photo\('tomato-salad\.jpg'\)/)
  assert.match(menu, /photo\('greens-croutons\.jpg'\)/)
  assert.match(menu, /photo\('corey-skinner\.jpg'\)/)
  assert.match(menu, /Montana Mac BBQ/)
  assert.match(menu, /Corey Skinner/)
  assert.match(menu, /16 years/)
  assert.match(menu, /Not set/)
  assert.doesNotMatch(menu, /\$\d/)
  assert.doesNotMatch(menu, /price\s*:/i)
  assert.doesNotMatch(menu, /sample: true/)
  assert.doesNotMatch(menu, /Noodles|Smokestack|Toast|Square/)
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /height:\s*100dvh/)
  assert.match(css, /flex-wrap:\s*wrap/)
  assert.match(css, /scale\(1\.14\)/)
  assert.doesNotMatch(css, /position:\s*sticky/)
  for (const name of [
    'chips-salsa.jpg',
    'ham-board.jpg',
    'fruit-tray.jpg',
    'five-dollar-special.jpg',
    'ribs.jpg',
    'shrimp-mushrooms.jpg',
    'tacos.jpg',
    'burritos.jpg',
    'roast-beef-subs.jpg',
    'ham-subs.jpg',
    'tomato-lettuce.jpg',
    'tomato-salad.jpg',
    'greens-croutons.jpg',
    'corey-skinner.jpg',
  ]) {
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
    assert.match(guest, /Montana Mac BBQ/)
    assert.match(guest, /Corey Skinner/)
    assert.match(guest, /Meet Corey Skinner/)
    assert.match(guest, /16 years/)
    assert.match(guest, /Come check him out/)
    assert.match(guest, /\/photos\/corey-skinner\.jpg/)
    assert.match(guest, /Chips and salsa platter/)
    assert.match(guest, /\/photos\/chips-salsa\.jpg/)
    assert.match(guest, /photo-frame/)
    assert.match(guest, /Corn chips/)
    assert.match(guest, /From his photos\./)
    assert.match(guest, /Sauce on the side/)
    assert.match(guest, /Corey story/)
    assert.doesNotMatch(guest, /Name not in yet|Sample plate/)
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
