import pandas
import os

BASE_PATH = "/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/klimaa/simulacoes/output_files/reduce_consume"
CSV_PATH = os.path.join(BASE_PATH, "eplusout.csv")

def main():
    df = pandas.read_csv(CSV_PATH)
    bad_pmv_counter = {
        "SALA_AULA" : 0,
        "ATELIE1" : 0,
        "ATELIE2" : 0,
        "ATELIE3" : 0,
        "LINSE" : 0,
        "RECEPCAO" : 0,
        "SEC_LINSE" : 0
    }

    for room in bad_pmv_counter.keys():
        people_presence_counter = df[df[f"PEOPLE_{room}:People Occupant Count [](TimeStep)"] > 0.0]
        filtered_df = df[(df[f"PEOPLE_{room}:People Occupant Count [](TimeStep)"] > 0.0) & ((df[f"PEOPLE_{room}:Zone Thermal Comfort Fanger Model PMV [](TimeStep)"] > 1.1) | (df[f"PEOPLE_{room}:Zone Thermal Comfort Fanger Model PMV [](TimeStep)"] < -1.1))]
        if room != "SEC_LINSE":
            ac_turn_on_counter = len(df[df[f"AC_{room}:Schedule Value [](TimeStep)"] == 1.0])
        else:
            ac_turn_on_counter = len(df[df[f"AC_{room}:Schedule Value [](TimeStep) "] == 1.0])
        vent_turn_on_counter = len(df[df[f"VEL_{room}:Schedule Value [](TimeStep)"] > 0.0])

        bad_pmv_counter[room] = len(filtered_df)
        
        print(f"Desconforto {room} : {len(filtered_df)}")
        print(f"Ar condicionado {room} : {ac_turn_on_counter}")
        print(f"Ventilador {room} : {vent_turn_on_counter}")
        
        print("")

        if len(filtered_df) > 0:
            filtered_df.to_csv(os.path.join(BASE_PATH, f"bad_pmvs_{room}.csv"), index=False)

    #print(bad_pmv_counter)

def get_only_important_columns():
    rooms = ["SALA_AULA", "ATELIE1", "ATELIE2", "ATELIE3", "LINSE", "RECEPCAO", "SEC_LINSE"]

    df = pandas.read_csv(CSV_PATH)
    clean_df = df[["Date/Time"]]

    for room in rooms:
        clean_df = pandas.concat([clean_df, df[[f"PEOPLE_{room}:People Occupant Count [](TimeStep)"]], df[[f"PEOPLE_{room}:Zone Thermal Comfort Clothing Value [clo](TimeStep)"]], df[[f"PEOPLE_{room}:Zone Thermal Comfort Fanger Model PMV [](TimeStep)"]]], axis=1)
        if room != "SEC_LINSE":
            clean_df = pandas.concat([clean_df, df[[f"AC_{room}:Schedule Value [](TimeStep)"]], df[[f"TEMP_AC_{room}:Schedule Value [](TimeStep)"]], df[[f"VEL_{room}:Schedule Value [](TimeStep)"]]], axis=1)
        else:
            clean_df = pandas.concat([clean_df, df[[f"AC_{room}:Schedule Value [](TimeStep) "]], df[[f"TEMP_AC_{room}:Schedule Value [](TimeStep)"]], df[[f"VEL_{room}:Schedule Value [](TimeStep)"]]], axis=1)

    print(len(clean_df))
    clean_df.to_csv(os.path.join(BASE_PATH, f"clean.csv"), index=False)

if __name__ == "__main__":
    main()
    get_only_important_columns()