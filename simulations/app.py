from tkinter import Tk
from simulations import run_simulation

def setup_window():
    # Create window
    window = Tk()
    window.title("EnergyPlus Custom Simulations")
    window.config(padx=10, pady=100)

    # Create labels

    # Create textboxes

    # Create buttons

    return window

if __name__ == "__main__":
    window = setup_window()
    window.mainloop()