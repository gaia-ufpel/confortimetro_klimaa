import pandas
import os
import esoreader

BASE_PATH = "/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/gaia/klimaa/simulations/assets/outputs/FAURB_50_PTHP_8"
CSV_PATH = os.path.join(BASE_PATH, "eplusout.csv")

PEOPLE_COLUMN = 'PEOPLE_{}:People Occupant Count [](TimeStep)'
AC_COLUMN = 'AC_{}:Schedule Value [](TimeStep)'
COOLING_COLUMN = '{} PTHP:Zone Packaged Terminal Heat Pump Total Cooling Rate [W](TimeStep) '
HEATING_COLUMN = '{} PTHP:Zone Packaged Terminal Heat Pump Total Heating Rate [W](TimeStep)'
VENT_COLUMN = 'VENT_{}:Schedule Value [](TimeStep)'
JANELA_COLUMN = 'JANELA_{}:Schedule Value [](TimeStep)'
EM_CONFORTO_COLUMN = 'EM_CONFORTO_{}:Schedule Value [](TimeStep)'

def summary_results_from_room(csv_path, room):
    df = pandas.read_csv(csv_path)
    base_path = csv_path[:-13]
    #print(base_path)

    target_cols = ["Date/Time",
                   "Environment:Site Outdoor Air Drybulb Temperature [C](TimeStep)"
    ]
    target_cols.extend(filter(lambda x: room in x, df.columns))
    result = df[target_cols]
    result = result.drop(result.index[:288])

    result.to_excel(os.path.join(base_path, f"{room}.xlsx"), index=False)

def get_stats_from_simulation(output_path, room):
    df = pandas.read_excel(os.path.join(output_path, f"{room}.xlsx"))
    print(f'AC ON: {get_air_conditioning_use(df, room)} | {get_air_heating_use(df, room)} | {get_air_cooling_use(df, room)} - VENT ON: {get_ventilation_use(df, room)} - WINDOW OPEN: {get_window_use(df, room)} - IN COMFORT: {get_num_in_comfort(df, room)} - NUM PEOPLE: {get_num_people_occupancy(df, room)}')

def get_air_conditioning_use(df, room):
    return get_air_cooling_use(df, room) + get_air_heating_use(df, room)

def get_air_cooling_use(df, room):
    return len(df[(df[PEOPLE_COLUMN.format(room)] != 0) & (df[COOLING_COLUMN.format(room)] != 0)])

def get_air_heating_use(df, room):
    return len(df[(df[PEOPLE_COLUMN.format(room)] != 0) & (df[HEATING_COLUMN.format(room)] != 0)])

def get_ventilation_use(df, room):
    return len(df[(df[PEOPLE_COLUMN.format(room)] != 0) & (df[VENT_COLUMN.format(room)] == 1)])

def get_window_use(df, room):
    return len(df[(df[PEOPLE_COLUMN.format(room)] != 0) & (df[JANELA_COLUMN.format(room)] == 1)])

def get_num_in_comfort(df, room):
    return len(df[(df[PEOPLE_COLUMN.format(room)] != 0) & (df[EM_CONFORTO_COLUMN.format(room)] == 1)])

def get_num_people_occupancy(df, room):
    return len(df[df[PEOPLE_COLUMN.format(room)] != 0])

def summary_results():
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

def process_esofile(rooms, output_path):
    eso = esoreader.read_from_path(os.path.join(output_path, "eplusout.eso"))

    for room in rooms:
        df = pandas.DataFrame()

        timesteps = pandas.Series(pandas.date_range('2017-01-01', '2017-12-31 T23:50', freq='10min'))

        df = pandas.concat([
            df,
            timesteps,
            eso.to_frame("Site Outdoor Air Drybulb Temperature"),
            eso.to_frame("People Occupant Count")[f"PEOPLE_{room.upper()}"],
            eso.to_frame("Zone Mean Radiant Temperature")[f"{room.upper()}"],
            eso.to_frame("Zone Operative Temperature")[f"{room.upper()}"],
            eso.to_frame("Zone Air Temperature")[f"{room.upper()}"],
            eso.to_frame("Zone Air Relative Humidity")[f"{room.upper()}"],
            eso.to_frame("Zone Mean Radiant Temperature")[f"{room.upper()}"],
            eso.to_frame("Zone Air CO2 Concentration")[f"{room.upper()}"],
            eso.to_frame("Zone Thermal Comfort Fanger Model PMV")[f"PEOPLE_{room.upper()}"],
            #eso.to_frame("Zone Thermal Comfort Clothing Value")[f"PEOPLE_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"CLO"],
            eso.to_frame("Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature")[f"PEOPLE_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"JANELA_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"VENT_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"VEL_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"AC_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"TEMP_COOL_AC_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"TEMP_HEAT_AC_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"PMV_PYTHERMAL_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"ADAPTATIVO_PYTHERMAL_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"TEMP_OP_MAX_ADAP_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"ADAP_MIN_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"ADAP_MAX_{room.upper()}"],
            eso.to_frame("Schedule Value")[f"EM_CONFORTO_{room.upper()}"],
            eso.to_frame("Zone Packaged Terminal Heat Pump Total Cooling Energy")[f"{room.upper()} PTHP"],
            eso.to_frame("Zone Packaged Terminal Heat Pump Total Heating Energy")[f"{room.upper()} PTHP"],
            eso.to_frame("Zone Ventilation Air Change Rate")[f"{room.upper()}"]
        ], axis=1)

        df.columns = [
            "TimeStep",
            "Site Outdoor Air Drybulb Temperature",
            "People Occupant Count",
            "Zone Mean Radiant Temperature",
            "Zone Operative Temperature",
            "Zone Air Temperature",
            "Zone Air Relative Humidity",
            "Zone Mean Radiant Temperature",
            "Zone Air CO2 Concentration",
            "Zone Thermal Comfort Fanger Model PMV",
            "Clothing Value",
            "Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature",
            f"JANELA_{room.upper()}",
            f"VENT_{room.upper()}",
            f"VEL_{room.upper()}",
            f"AC_{room.upper()}",
            f"TEMP_COOL_AC_{room.upper()}",
            f"TEMP_HEAT_AC_{room.upper()}",
            f"PMV_PYTHERMAL_{room.upper()}",
            f"ADAPTATIVO_PYTHERMAL_{room.upper()}",
            f"TEMP_OP_MAX_ADAP_{room.upper()}",
            f"ADAP_MIN_{room.upper()}",
            f"ADAP_MAX_{room.upper()}",
            f"EM_CONFORTO_{room.upper()}",
            "Zone Packaged Terminal Heat Pump Total Cooling Energy",
            "Zone Packaged Terminal Heat Pump Total Heating Energy",
            "Zone Ventilation Air Change Rate"
        ]

        df.to_csv(os.path.join(output_path, f"{room}.csv"), index=False)

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
    important_columns = [
        "Date/Time",
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

    df = pandas.read_csv(CSV_PATH)
    clean_df = df[["Date/Time"]]

    for room in rooms:
        target_columns = [
            "Date/Time",
            "Environment:Site Outdoor Air Drybulb Temperature [C](TimeStep)",
            f"PEOPLE_{room.upper()}:People Occupant Count [](TimeStep)",
            f"{room.upper()}:Zone Mean Radiant Temperature [C](TimeStep)",
            f"{room.upper()}:Zone Operative Temperature [C](TimeStep)",
            f"{room.upper()}:Zone Air Temperature [C](TimeStep)",
            f"{room.upper()}:Zone Air Relative Humidity [%](TimeStep)",
            f"{room.upper()}:Zone Air CO2 Concentration [ppm](TimeStep)",
            f"PEOPLE_{room.upper()}:Zone Thermal Comfort Fanger Model PMV [](TimeStep)",
            f"PEOPLE_{room.upper()}:Zone Thermal Comfort Clothing Value [clo](TimeStep)",
            f"PEOPLE_{room.upper()}:Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature [C](TimeStep)",
            f"JANELA_{room.upper()}:Schedule Value [](TimeStep)",
            f"VENT_{room.upper()}:Schedule Value [](TimeStep)",
            f"VEL_{room.upper()}:Schedule Value [](TimeStep)",
            f"AC_{room.upper()}:Schedule Value [](TimeStep)",
            f"TEMP_AC_{room.upper()}:Schedule Value [](TimeStep)",
            f"PMV_PYTHERMAL_{room.upper()}:Schedule Value [](TimeStep)",
            f"ADAPTATIVO_PYTHERMAL_{room.upper()}:Schedule Value [](TimeStep)",
            f"TEMP_OP_MAX_ADAP_{room.upper()}:Schedule Value [](TimeStep)",
            f"ADAP_MIN_{room.upper()}:Schedule Value [](TimeStep)",
            f"ADAP_MAX_{room.upper()}:Schedule Value [](TimeStep)",
            f"EM_CONFORTO_{room.upper()}:Schedule Value [](TimeStep)",
            f"{room.upper()} IDEAL LOADS AIR SYSTEM:Zone Ideal Loads Supply Air Mass Flow Rate [kg/s](TimeStep)"
        ]

        clean_df = pandas.concat([clean_df, df[[f"PEOPLE_{room}:People Occupant Count [](TimeStep)"]], df[[f"PEOPLE_{room}:Zone Thermal Comfort Clothing Value [clo](TimeStep)"]], df[[f"PEOPLE_{room}:Zone Thermal Comfort Fanger Model PMV [](TimeStep)"]]], axis=1)
        if room != "SEC_LINSE":
            clean_df = pandas.concat([clean_df, df[[f"AC_{room}:Schedule Value [](TimeStep)"]], df[[f"TEMP_AC_{room}:Schedule Value [](TimeStep)"]], df[[f"VEL_{room}:Schedule Value [](TimeStep)"]]], axis=1)
        else:
            clean_df = pandas.concat([clean_df, df[[f"AC_{room}:Schedule Value [](TimeStep) "]], df[[f"TEMP_AC_{room}:Schedule Value [](TimeStep)"]], df[[f"VEL_{room}:Schedule Value [](TimeStep)"]]], axis=1)

    print(len(clean_df))
    clean_df.to_csv(os.path.join(BASE_PATH, f"clean.csv"), index=False)

if __name__ == "__main__":
    rooms = [
        "SALA_AULA",
        "ATELIE1",
        "ATELIE2",
        "ATELIE3",
        "RECEPCAO",
        "SEC_LINSE",
        "LINSE"
    ]
    #process_esofile(["SALA_AULA","RECEPCAO","SEC_LINSE","LINSE","ATELIE1","ATELIE2","ATELIE3"], "./assets/outputs/FAURB_50_16/")
    for room in rooms:
        summary_results_from_room(CSV_PATH, room)
    #get_stats_from_simulation("./assets/outputs/FAURB_50_PTHP_2", "ATELIE1")