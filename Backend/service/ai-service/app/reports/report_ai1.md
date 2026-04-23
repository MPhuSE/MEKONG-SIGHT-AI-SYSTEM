# AI1 Report - 7-day Salinity Forecast

- Model version: `20260415182653`
- Provinces used: Bac Lieu, Ben Tre, Ca Mau, Kien Giang, Soc Trang

## Dataset
- Granularity: daily province-level.
- Baseline features: lag salinity, lag weather, rolling stats, seasonality, province one-hot.
- XGBoost features: baseline features plus cyclic time, salinity trend, short-rainfall context, and dry-season interactions.
- Split: 70% train, 15% val, 15% test (time-ordered, no shuffle).

## Metrics (day1/day3/day7)
| horizon | model | mae | rmse |
| --- | --- | --- | --- |
| 1 | baseline_linear | 0.4705 | 0.5522 |
| 1 | xgboost | 0.3195 | 0.3879 |
| 3 | baseline_linear | 0.6 | 0.6951 |
| 3 | xgboost | 0.3999 | 0.476 |
| 7 | baseline_linear | 0.9087 | 1.0317 |
| 7 | xgboost | 0.5738 | 0.6637 |

## Champion by Horizon (production)
| horizon | champion_model |
| --- | --- |
| day1 | xgboost |
| day2 | xgboost |
| day3 | xgboost |
| day4 | xgboost |
| day5 | xgboost |
| day6 | xgboost |
| day7 | xgboost |

## Full Metrics (day1..day7)
| horizon | model | mae | rmse |
| --- | --- | --- | --- |
| 1 | baseline_linear | 0.4705 | 0.5522 |
| 1 | xgboost | 0.3195 | 0.3879 |
| 2 | baseline_linear | 0.4808 | 0.5647 |
| 2 | xgboost | 0.355 | 0.4256 |
| 3 | baseline_linear | 0.6 | 0.6951 |
| 3 | xgboost | 0.3999 | 0.476 |
| 4 | baseline_linear | 0.6213 | 0.7191 |
| 4 | xgboost | 0.4429 | 0.5241 |
| 5 | baseline_linear | 0.7183 | 0.8289 |
| 5 | xgboost | 0.4587 | 0.5424 |
| 6 | baseline_linear | 0.816 | 0.9375 |
| 6 | xgboost | 0.5336 | 0.6184 |
| 7 | baseline_linear | 0.9087 | 1.0317 |
| 7 | xgboost | 0.5738 | 0.6637 |

## Rolling-origin Backtest Summary
| model | horizon | mae_mean | mae_std | rmse_mean | rmse_std | fold_count |
| --- | --- | --- | --- | --- | --- | --- |
| baseline_linear | 1 | 0.3505 | 0.1372 | 0.4098 | 0.1424 | 8 |
| xgboost | 1 | 0.2308 | 0.0568 | 0.2886 | 0.0601 | 8 |
| baseline_linear | 2 | 0.3793 | 0.1497 | 0.4414 | 0.1543 | 8 |
| xgboost | 2 | 0.2496 | 0.0803 | 0.3079 | 0.084 | 8 |
| baseline_linear | 3 | 0.4506 | 0.2156 | 0.5176 | 0.216 | 8 |
| xgboost | 3 | 0.2585 | 0.0983 | 0.3176 | 0.1022 | 8 |
| baseline_linear | 4 | 0.493 | 0.2407 | 0.5596 | 0.2405 | 8 |
| xgboost | 4 | 0.2709 | 0.1246 | 0.3309 | 0.1282 | 8 |
| baseline_linear | 5 | 0.5677 | 0.3091 | 0.6344 | 0.306 | 8 |
| xgboost | 5 | 0.2849 | 0.1283 | 0.3468 | 0.1326 | 8 |
| baseline_linear | 6 | 0.6283 | 0.3508 | 0.6956 | 0.3455 | 8 |
| xgboost | 6 | 0.2955 | 0.1634 | 0.3523 | 0.1647 | 8 |
| baseline_linear | 7 | 0.6509 | 0.3644 | 0.7177 | 0.3605 | 8 |
| xgboost | 7 | 0.326 | 0.1862 | 0.3896 | 0.1925 | 8 |

## Error by Season (dry vs rainy)
| model | horizon | season | mae | rmse | sample_size |
| --- | --- | --- | --- | --- | --- |
| baseline_linear | 1 | dry | 0.5768 | 0.6358 | 115 |
| baseline_linear | 1 | rainy | 0.3861 | 0.4756 | 145 |
| baseline_linear | 3 | dry | 0.8319 | 0.8765 | 115 |
| baseline_linear | 3 | rainy | 0.4161 | 0.507 | 145 |
| baseline_linear | 7 | dry | 1.2312 | 1.2707 | 115 |
| baseline_linear | 7 | rainy | 0.653 | 0.7923 | 145 |
| xgboost | 1 | dry | 0.3755 | 0.4446 | 115 |
| xgboost | 1 | rainy | 0.2751 | 0.3363 | 145 |
| xgboost | 3 | dry | 0.4825 | 0.5497 | 115 |
| xgboost | 3 | rainy | 0.3343 | 0.4081 | 145 |
| xgboost | 7 | dry | 0.7158 | 0.771 | 115 |
| xgboost | 7 | rainy | 0.4612 | 0.5643 | 145 |

## Threshold Accuracy Summary
| model | horizon | tolerance_ppt | hit_count | total_count | accuracy_pct | target_accuracy_pct | accuracy_status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline_linear | 1 | 0.75 | 213 | 260 | 81.92 | 75.0 | pass |
| xgboost | 1 | 0.75 | 247 | 260 | 95.0 | 75.0 | pass |
| baseline_linear | 2 | 0.75 | 207 | 260 | 79.62 | 75.0 | pass |
| xgboost | 2 | 0.75 | 242 | 260 | 93.08 | 75.0 | pass |
| baseline_linear | 3 | 1.0 | 225 | 260 | 86.54 | 65.0 | pass |
| xgboost | 3 | 1.0 | 254 | 260 | 97.69 | 65.0 | pass |
| baseline_linear | 4 | 1.0 | 221 | 260 | 85.0 | 65.0 | pass |
| xgboost | 4 | 1.0 | 251 | 260 | 96.54 | 65.0 | pass |
| baseline_linear | 5 | 1.0 | 188 | 260 | 72.31 | 65.0 | pass |
| xgboost | 5 | 1.0 | 248 | 260 | 95.38 | 65.0 | pass |
| baseline_linear | 6 | 1.25 | 212 | 260 | 81.54 | 55.0 | pass |
| xgboost | 6 | 1.25 | 255 | 260 | 98.08 | 55.0 | pass |
| baseline_linear | 7 | 1.25 | 191 | 260 | 73.46 | 55.0 | pass |
| xgboost | 7 | 1.25 | 254 | 260 | 97.69 | 55.0 | pass |

## Acceptance Summary (80% Gate)
| horizon | selected_model | evaluation_model | selected_rmse | evaluation_rmse | baseline_rmse | vs_baseline_status | within_tolerance_accuracy_pct | tolerance_ppt | target_accuracy_pct | accuracy_status | selection_status | regression_status | overall_status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | xgboost | xgboost | 0.39 | 0.39 | 0.55 | pass | 95.0 | 0.75 | 75.0 | pass | pass | no_previous | pass |
| 2 | xgboost | xgboost | 0.43 | 0.43 | 0.56 | pass | 93.08 | 0.75 | 75.0 | pass | pass | not_checked | pass |
| 3 | xgboost | xgboost | 0.48 | 0.48 | 0.7 | pass | 97.69 | 1.0 | 65.0 | pass | pass | no_previous | pass |
| 4 | xgboost | xgboost | 0.52 | 0.52 | 0.72 | pass | 96.54 | 1.0 | 65.0 | pass | pass | not_checked | pass |
| 5 | xgboost | xgboost | 0.54 | 0.54 | 0.83 | pass | 95.38 | 1.0 | 65.0 | pass | pass | not_checked | pass |
| 6 | xgboost | xgboost | 0.62 | 0.62 | 0.94 | pass | 98.08 | 1.25 | 55.0 | pass | pass | not_checked | pass |
| 7 | xgboost | xgboost | 0.66 | 0.66 | 1.03 | pass | 97.69 | 1.25 | 55.0 | pass | pass | no_previous | pass |

## LSTM Pilot
| horizon | model | mae | rmse | status | note | best_hidden_size | best_dropout | best_val_rmse |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | lstm_pilot | nan | nan | skipped | LSTM pilot disabled by flag. | None | None | None |
| 2 | lstm_pilot | nan | nan | skipped | LSTM pilot disabled by flag. | None | None | None |
| 3 | lstm_pilot | nan | nan | skipped | LSTM pilot disabled by flag. | None | None | None |
| 4 | lstm_pilot | nan | nan | skipped | LSTM pilot disabled by flag. | None | None | None |
| 5 | lstm_pilot | nan | nan | skipped | LSTM pilot disabled by flag. | None | None | None |
| 6 | lstm_pilot | nan | nan | skipped | LSTM pilot disabled by flag. | None | None | None |
| 7 | lstm_pilot | nan | nan | skipped | LSTM pilot disabled by flag. | None | None | None |

## Regression Check vs Previous Version
| horizon | previous_rmse | current_rmse | pct_change | status |
| --- | --- | --- | --- | --- |
| 1 | None | 0.3879296705587769 | 0.0% | no_previous |
| 3 | None | 0.475956759942757 | 0.0% | no_previous |
| 7 | None | 0.6637320270073744 | 0.0% | no_previous |

Regression gate note:
- PASS: No horizon exceeded 10% RMSE degradation threshold.

## Charts
- Error by season chart: `C:/Users/Administrator/Desktop/mekong-sight-ai/Backend/service/ai-service/app/reports/charts/error_by_season.png`
- Actual vs predicted chart: `C:/Users/Administrator/Desktop/mekong-sight-ai/Backend/service/ai-service/app/reports/charts/actual_vs_pred_bac_lieu.png`
- Actual vs predicted chart: `C:/Users/Administrator/Desktop/mekong-sight-ai/Backend/service/ai-service/app/reports/charts/actual_vs_pred_ben_tre.png`
- Actual vs predicted chart: `C:/Users/Administrator/Desktop/mekong-sight-ai/Backend/service/ai-service/app/reports/charts/actual_vs_pred_ca_mau.png`
- Actual vs predicted chart: `C:/Users/Administrator/Desktop/mekong-sight-ai/Backend/service/ai-service/app/reports/charts/actual_vs_pred_kien_giang.png`
- Actual vs predicted chart: `C:/Users/Administrator/Desktop/mekong-sight-ai/Backend/service/ai-service/app/reports/charts/actual_vs_pred_soc_trang.png`

## Limitations
- Model is province-level; not optimized for per-farm microclimate.
- Missing weather values are interpolated and can reduce reliability.
- Direct multi-step forecasts are independent between horizons.