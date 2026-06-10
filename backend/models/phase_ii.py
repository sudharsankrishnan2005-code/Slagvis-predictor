"""
Phase-II empirical slag viscosity model.

log10(η) = 1.777 + 0.0333(SiO2) + 0.0303(Al2O3) - 0.0036(MgO)
           - 0.0047(MnO) + 0.0074(K2O) + 0.0055(TiO2) - 0.00263(T)

η = 10^(log10 η)  [Pa·s]
"""

from models.base import BaseModel, Contribution, ViscosityResult, interpret_viscosity


class PhaseIIModel(BaseModel):
    """Phase-II OLS regression model for metallurgical slag viscosity."""

    INTERCEPT = 1.777
    COEFFICIENTS = {
        "SiO2": 0.0333,
        "Al2O3": 0.0303,
        "MgO": -0.0036,
        "MnO": -0.0047,
        "K2O": 0.0074,
        "TiO2": 0.0055,
        "Temperature": -0.00263,
    }

    EQUATION_LATEX = (
        r"\log_{10}(\eta) = 1.777 + 0.0333\,\mathrm{SiO_2} + 0.0303\,\mathrm{Al_2O_3}"
        r" - 0.0036\,\mathrm{MgO} - 0.0047\,\mathrm{MnO} + 0.0074\,\mathrm{K_2O}"
        r" + 0.0055\,\mathrm{TiO_2} - 0.00263\,T"
    )

    EQUATION_PLAIN = (
        "log10(η) = 1.777 + 0.0333(SiO2) + 0.0303(Al2O3) - 0.0036(MgO)"
        " - 0.0047(MnO) + 0.0074(K2O) + 0.0055(TiO2) - 0.00263(T)"
    )

    @property
    def model_id(self) -> str:
        return "phase_ii"

    @property
    def model_name(self) -> str:
        return "Phase-II Empirical Model"

    @property
    def equation_latex(self) -> str:
        return self.EQUATION_LATEX

    @property
    def equation_plain(self) -> str:
        return self.EQUATION_PLAIN

    @property
    def coefficients(self) -> dict[str, float]:
        return {"Intercept": self.INTERCEPT, **self.COEFFICIENTS}

    def calculate(
        self,
        sio2: float,
        al2o3: float,
        mgo: float,
        mno: float,
        k2o: float,
        tio2: float,
        temperature: float,
    ) -> ViscosityResult:
        inputs = {
            "SiO2": (sio2, "wt.%"),
            "Al2O3": (al2o3, "wt.%"),
            "MgO": (mgo, "wt.%"),
            "MnO": (mno, "wt.%"),
            "K2O": (k2o, "wt.%"),
            "TiO2": (tio2, "wt.%"),
            "Temperature": (temperature, "°C"),
        }

        contributions: list[Contribution] = []
        log_eta = self.INTERCEPT

        for var, (value, unit) in inputs.items():
            coef = self.COEFFICIENTS[var]
            term = coef * value
            log_eta += term
            contributions.append(
                Contribution(
                    variable=var,
                    coefficient=coef,
                    input_value=value,
                    contribution=term,
                    unit=unit,
                )
            )

        viscosity = 10**log_eta

        return ViscosityResult(
            model_id=self.model_id,
            model_name=self.model_name,
            log_eta=log_eta,
            viscosity=viscosity,
            interpretation=interpret_viscosity(viscosity),
            contributions=contributions,
            intercept=self.INTERCEPT,
            equation_latex=self.equation_latex,
            equation_plain=self.equation_plain,
        )


def calculate_viscosity(
    sio2: float,
    al2o3: float,
    mgo: float,
    mno: float,
    k2o: float,
    tio2: float,
    temperature: float,
) -> dict:
    """
    Calculate slag viscosity using Phase-II empirical equation.

    Returns dict with log_eta, viscosity, and full breakdown.
    """
    result = PhaseIIModel().calculate(
        sio2=sio2,
        al2o3=al2o3,
        mgo=mgo,
        mno=mno,
        k2o=k2o,
        tio2=tio2,
        temperature=temperature,
    )
    return {
        "log_eta": result.log_eta,
        "viscosity": result.viscosity,
        **result.to_dict(),
    }
