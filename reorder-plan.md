# Reorder-to-PDF plan

- parsed PDF questions: 652
- stored questions: 660
- already PDF order (identity): 484
- **will reorder: 32**
- unmatched / left as-is: 144 (includes prose-ref exclusions below)
- excluded for safety (explanation has prose letter refs): 17 -> [59, 88, 96, 101, 102, 117, 128, 132, 137, 327, 342, 404, 463, 520, 556, 627, 678]

## Known-case sanity (expected correctAnswer after reorder)

- id 269: expect `c`, got `c (unchanged/identity)`  OK
- id 323: expect `b`, got `b (unchanged/identity)`  OK
- id 258: expect `d`, got `d (unchanged/identity)`  OK
- id 260: expect `c`, got `c (unchanged/identity)`  OK
- id 373: expect `b`, got `b (unchanged/identity)`  OK

## Sample reorders

- id 312 (baze-de-date) order stored->pdf ['d', 'c', 'a', 'b'], correct b->d
- id 313 (baze-de-date) order stored->pdf ['c', 'a', 'd', 'b'], correct d->c
- id 322 (baze-de-date) order stored->pdf ['c', 'd', 'b', 'a'], correct b->c
- id 328 (baze-de-date) order stored->pdf ['d', 'b', 'a', 'c'], correct a->c
- id 329 (baze-de-date) order stored->pdf ['b', 'd', 'a', 'c'], correct c->d
- id 331 (baze-de-date) order stored->pdf ['a', 'c', 'b', 'd'], correct d->d
- id 335 (baze-de-date) order stored->pdf ['b', 'c', 'd', 'a'], correct d->c
- id 337 (baze-de-date) order stored->pdf ['a', 'd', 'c', 'b'], correct d->b

## Unmatched ids (left untouched)

6, 11, 12, 13, 14, 45, 49, 50, 55, 58, 59, 63, 64, 69, 77, 83, 84, 88, 92, 93, 94, 95, 96, 100, 101, 102, 103, 106, 107, 108, 109, 111, 112, 113, 114, 117, 120, 121, 122, 127, 128, 129, 130, 132, 133, 135, 137, 138, 140, 210, 215, 222, 255, 256, 257, 272, 276, 280, 281, 282, 283, 284, 314, 327, 330, 336, 340, 342, 349, 351, 354, 355, 366, 367, 368, 369, 370, 371, 372, 374, 387, 388, 402, 403, 404, 405, 463, 520, 533, 556, 577, 578, 604, 605, 627, 630, 631, 632, 633, 634, 635, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 714, 715