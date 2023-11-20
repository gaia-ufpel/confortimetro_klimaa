from tkinter import Tk, Label, Entry, Button, filedialog, ttk
from simulations import run_simulation

def silly_command():
    print(website_entry.get())

def browse_idf():
    filename = filedialog.askopenfilename(initialdir = "./assets/inputs", title = "Select IDF File", filetypes = (("IDF Files","*.idf"),("all files","*.*")))
    inputfile_label.configure(text=f"IDF File: {filename}")

def browse_output():
    filename = filedialog.askdirectory(initialdir = "./assets/outputs", title = "Select Output Folder")
    outputfolder_label.configure(text=f"Output Folder: {filename}")

def browse_weather():
    filename = filedialog.askopenfilename(initialdir = "./assets/inputs", title = "Select Weather File", filetypes = (("EPW Files","*.epw"),("all files","*.*")))
    weatherfile_label.configure(text=f"Weather File: {filename}")

def browse_ep():
    filename = filedialog.askdirectory(initialdir = "./assets/inputs", title = "Select EnergyPlus Folder")
    epfolder_label.configure(text=f"EnergyPlus Folder: {filename}")

def run():
    run_simulation()

if __name__ == "__main__":
    # Create window
    window = Tk()
    window.title("EnergyPlus Custom Simulations")
    window.config(padx=10, pady=100)

    # Input file
    inputfile_label = Label(text="IDF File:")
    inputfile_label.grid(row=0, column=0)
    inputfile_button = Button(text="Browse", width=10, command=browse_idf)
    inputfile_button.grid(row=0, column=1)

    # Output folder
    outputfolder_label = Label(text="Output Folder:")
    outputfolder_label.grid(row=1, column=0)
    outputfolder_button = Button(text="Browse", width=10, command=browse_output)
    outputfolder_button.grid(row=1, column=1)

    # Weather file
    weatherfile_label = Label(text="Weather File:")
    weatherfile_label.grid(row=2, column=0)
    weatherfile_button = Button(text="Browse", width=10, command=browse_weather)
    weatherfile_button.grid(row=2, column=1)

    # EnergyPlus folder
    epfolder_label = Label(text="EnergyPlus Folder:")
    epfolder_label.grid(row=3, column=0)
    epfolder_button = Button(text="Browse", width=10, command=browse_ep)
    epfolder_button.grid(row=3, column=1)

    # Rooms
    rooms_label = Label(text="Rooms:")
    rooms_label.grid(row=4, column=0)
    rooms_entry = Entry(width=10)
    rooms_entry.grid(row=5, column=0)

    # PMV upperbound
    pmv_upperbound_label = Label(text="PMV Upperbound:")
    pmv_upperbound_label.grid(row=6, column=0)
    pmv_upperbound_entry = Entry(width=10)
    pmv_upperbound_entry.grid(row=7, column=0)

    # PMV lowerbound
    pmv_lowerbound_label = Label(text="PMV Lowerbound:")
    pmv_lowerbound_label.grid(row=6, column=1)
    pmv_lowerbound_entry = Entry(width=10)
    pmv_lowerbound_entry.grid(row=7, column=1)

    # Velocity max
    vel_max_label = Label(text="Velocity Max:")
    vel_max_label.grid(row=6, column=2)
    vel_max_entry = Entry(width=10)
    vel_max_entry.grid(row=7, column=2)

    # Temperature ac max
    temp_ac_max_label = Label(text="Temperature AC Max:")
    temp_ac_max_label.grid(row=8, column=0)
    temp_ac_max_entry = Entry(width=10)
    temp_ac_max_entry.grid(row=9, column=0)

    # Temperature ac min
    temp_ac_min_label = Label(text="Temperature AC Min:")
    temp_ac_min_label.grid(row=8, column=1)
    temp_ac_min_entry = Entry(width=10)
    temp_ac_min_entry.grid(row=9, column=1)

    # Met
    met_label = Label(text="Met:")
    met_label.grid(row=8, column=2)
    met_entry = Entry(width=10)
    met_entry.grid(row=9, column=2)

    # Wme
    wme_label = Label(text="Wme:")
    wme_label.grid(row=8, column=3)
    wme_entry = Entry(width=10)
    wme_entry.grid(row=9, column=3)

    # Run button
    run_button = Button(text="Run", width=40, command=run)
    run_button.grid(row=10, column=0, columnspan=2)

    window.mainloop()