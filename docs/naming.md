# 🏷️ Naming

Every semantic token follows one pattern:

```text
color . bg . brand . bold - hover
  │      │     │      │      └── state     hover · pressed · selected · disabled
  │      │     │      └───────── emphasis  subtle · bold
  │      │     └──────────────── role      neutral · brand · danger · success · warning · info
  │      └────────────────────── property  bg · text · icon · border · surface
  └───────────────────────────── category  color · space · size · radius · shadow · motion · …
```

Names describe **meaning, never appearance or mode**. There is no `orange-600` and no `dark-bg`.
The same name holds the right value in light and dark, so code never needs to know which scheme is
active.

---

[← Qeetrix Tokens](../README.md)
