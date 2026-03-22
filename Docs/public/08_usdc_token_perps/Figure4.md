graph LR
  subgraph Imperial
    I1[USDC LP Deposit L = 1,000,000] --> I2[Total Structural Capital\nK_I = L + 0.04·Q]
    I3[Gross OI Q = 830,000] --> I4[sysLev_I = Q / K_I ≈ 0.80x]
    I2 --> I4
  end

  subgraph Vibecaps
    V1[SIM Inventory T] --> V2[Structural Capital\nK_V = T]
    V3[Gross OI Q_V = λ·T] --> V4[sysLev_V = Q_V / K_V = λ]
    V2 --> V4
  end
