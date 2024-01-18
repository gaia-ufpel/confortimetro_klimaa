import pandas
import os

BASE_PATH = "/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/klimaa/simulacoes/output_files/reduce_consume"
CSV_PATH = os.path.join(BASE_PATH, "eplusout.csv")

def random_things():
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

def split_sheet(rooms, output_path):
    target_variables = ["Date/Time",
                        "Environment:Site Outdoor Air Drybulb Temperature [C](TimeStep)",
                        "PEOPLE_%%:People Occupant Count [](TimeStep)",
                        "%%:Zone Mean Radiant Temperature [C](TimeStep)",
                        "%%:Zone Operative Temperature [C](TimeStep)",
                        "%%:Zone Air Temperature [C](TimeStep)",
                        "%%:Zone Air Relative Humidity [%](TimeStep)",
                        "%%:Zone Air CO2 Concentration [ppm](TimeStep)",
                        "PEOPLE_%%:Zone Thermal Comfort Fanger Model PMV [](TimeStep)",
                        "PEOPLE_%%:Zone Thermal Comfort Clothing Value [clo](TimeStep)",
                        "PEOPLE_%%:Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature [C](TimeStep)",
                        "JANELA_%%:Schedule Value [](TimeStep)",
                        "VENT_%%:Schedule Value [](TimeStep)",
                        "VEL_%%:Schedule Value [](TimeStep)",
                        "AC_%%:Schedule Value [](TimeStep)",
                        "TEMP_AC_%%:Schedule Value [](TimeStep)",
                        "PMV_PYTHERMAL_%%:Schedule Value [](TimeStep)",
                        "ADAPTATIVO_PYTHERMAL_%%:Schedule Value [](TimeStep)",
                        "TEMP_OP_MAX_ADAP_%%:Schedule Value [](TimeStep)",
                        "ADAP_MIN_%%:Schedule Value [](TimeStep)",
                        "ADAP_MAX_%%:Schedule Value [](TimeStep)",
                        "EM_CONFORTO_%%:Schedule Value [](TimeStep)",
                        "%% IDEAL LOADS AIR SYSTEM:Zone Ideal Loads Supply Air Mass Flow Rate [kg/s](TimeStep)"
                    ]

    origin = pandas.read_csv(os.path.join(output_path, "eplusout.csv"))

    for room in rooms:
        df = pandas.DataFrame()

        for tv in target_variables:
            try:
                df = pandas.concat([df, origin[[tv.replace("%%", room)]]], axis=1)
            except:
                try:
                    df = pandas.concat([df, origin[[f"{tv} ".replace("%%", room)]]], axis=1)
                except:
                    pass

        
        df.to_csv(os.path.join(output_path, f"{room}.csv"), index=False)

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