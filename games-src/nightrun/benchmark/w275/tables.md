fatal runs: 0 []

## fps (60 s after 5 s warm-up; rounds r1/r2/r3 -> median [spread=(max-min)/median])
| cell | metric | base | integrated | integ vs base |
|---|---|---|---|---|
| flight phone | fps median | 8.18/9.23/9.23 -> 9.2 [11%] | 8.57/8.96/9.23 -> 9.0 [7%] | -2.9% |
| flight phone | p95 ms | 200/166.7/166.8 -> 166.8 [20%] | 166.8/166.6/183.3 -> 166.8 [10%] | +0.0% |
| flight phone | p99 ms | 316.6/233.4/283.3 -> 283.3 [29%] | 266.7/216.7/283.4 -> 266.7 [25%] | -5.9% |
| flight phone | long tasks >50ms | 495/559/538 -> 538.0 [12%] | 538/541/544 -> 541.0 [1%] | +0.6% |
| flight phone | alive at end | [True, True, True] | [True, True, True] | |
| flight pc | fps median | 16.72/16.45/17.14 -> 16.7 [4%] | 17/16.72/18.69 -> 17.0 [12%] | +1.7% |
| flight pc | p95 ms | 83.4/100/83.4 -> 83.4 [20%] | 83.4/99.9/83.4 -> 83.4 [20%] | +0.0% |
| flight pc | p99 ms | 100.1/100.1/100.1 -> 100.1 [0%] | 100.1/100/100 -> 100.0 [0%] | -0.1% |
| flight pc | long tasks >50ms | 713/656/679 -> 679.0 [8%] | 673/619/419 -> 619.0 [41%] | -8.8% |
| flight pc | alive at end | [True, True, True] | [True, True, True] | |
| street phone | fps median | 9.84/10.29/11.08 -> 10.3 [12%] | 10/11.25/11.25 -> 11.2 [11%] | +9.3% |
| street phone | p95 ms | 283.4/266.7/250 -> 266.7 [13%] | 266.7/233.3/233.4 -> 233.4 [14%] | -12.5% |
| street phone | p99 ms | 366.8/383.2/333.3 -> 366.8 [14%] | 416.6/300/283.4 -> 300.0 [44%] | -18.2% |
| street phone | long tasks >50ms | 311/318/331 -> 318.0 [6%] | 330/336/346 -> 336.0 [5%] | +5.7% |
| street phone | alive at end | [True, True, True] | [True, True, True] | |
| street pc | fps median | 36.78/34.43/37.5 -> 36.8 [8%] | 35.41/35.08/36.19 -> 35.4 [3%] | -3.7% |
| street pc | p95 ms | 83.3/99.9/83.3 -> 83.3 [20%] | 83.4/99.9/83.3 -> 83.4 [20%] | +0.1% |
| street pc | p99 ms | 133.3/150/133.3 -> 133.3 [13%] | 150/150/133.4 -> 150.0 [11%] | +12.5% |
| street pc | long tasks >50ms | 440/482/385 -> 440.0 [22%] | 504/447/464 -> 464.0 [12%] | +5.5% |
| street pc | alive at end | [True, True, True] | [True, True, True] | |

## cold start ms (median / max)
| dev | metric | base | integrated |
|---|---|---|---|
| phone | dcl | 4094 / 5854 (n=5) | 5685 / 6633 (n=5) |
| phone | title | 9265 / 9517 (n=5) | 6774 / 7820 (n=5) |
| phone | startToPlay | 2169 / 2459 (n=5) | 2146 / 2303 (n=5) |
| pc | dcl | 1104 / 1292 (n=5) | 1006 / 1132 (n=5) |
| pc | title | 2063 / 2139 (n=5) | 1265 / 1539 (n=5) |
| pc | startToPlay | 794 / 864 (n=5) | 872 / 926 (n=5) |
