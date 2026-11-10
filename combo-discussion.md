# Pre Bridal Combo - discussion notes

Status: discussion only. No code or database changes for the combo yet.

## Source details

- Name: Pre Bridal Combo
- Price: Rs 2800 total (selling price). No per-item prices shown.
- Contents:
  - Kumkumadi oil
  - Nalpamaradi oil
  - Neelibringadi oil
  - Eladi face pack
  - Rakthachandanadi face pack
  - Herbal bath powder
- Photo: gift box with two bottles (Neelibringadi and Nalpamaradi). Already added to the product images.
- Bottle sizes: client confirmed 200 ml for all the product inside.

## Already done

- Category "Combo" exists in the database: slug `combo`, icon `Leaf`, sort order 5, active.
- It was added by a one-off script, so `backend/src/scripts/seed-categories.ts` does not include it.
- Pre Bridal Combo created as an inactive draft (seeded from a JSON file in the scratchpad). Price 2800, MRP 2800 (placeholder until the client answers), stock 12, one variant "1 set". Needs a photo in admin, then unblock.
- Code: product type is optional (schema, entity, DTO, mapper), and "set" is a variant unit (backend and frontend). Not committed.
- Contents in the description. Kumkumadi 15 ml and the two oils at 200 ml are from the client. The face pack and bath powder weights (50 g, 50 g, 100 g) are demo values and need the client's real numbers.

## Decisions

1. Product type is optional for combos. Combos show under the Combo category, not the oil or face-pack filters.
2. Variant unit "set" is added for combos (for example "1 set").
3. Stock is tracked only on the combo. Contents' stock is not tracked.
4. Price is the total, Rs 2800, with no per-item prices.
5. Contents go in the description for now. They are not put in the ingredients field.

## Why the current schema doesn't fit

- `type` is required and limited to thailam, keram and face-pack. A combo mixes oils, face packs and bath powder, so no single type fits.
- Variant `unit` only allows ml, g, tablets and capsules. A combo is one box, so it needs a "set" unit.
- The schema has no field that links a combo to its contents, so contents can only be text.

## Open questions for the client

- Bottle sizes for the three oils: answered, 200 ml each.
- Weights of the two face packs and the bath powder: not answered. "200 ml" fits the oils, but face packs and bath powder are solids, so they need a weight in g. Confirm with the client.
- MRP: is it Rs 2800, or a higher figure?
- Stock count for the combo.
- Later, if wanted: a structured "What's in the box" list. This would be a new `includes` field. It is not needed for the first version.

## Options for contents

1. **Description only** (current plan). No code change. Plain text, not editable as a list.
2. **New `includes` field** with a simple list of names. Shown as a "What's in the box" section. Needs changes to the schema, form and product page.
3. **Link to real products.** Only useful once the individual products exist. Largest change; deferred.

## Next steps once the client answers

1. Make the type optional for combos and add the "set" unit (code change, after approval).
2. Create the Pre Bridal Combo in the Combo category with the client's numbers.
3. Add photos and unblock.
