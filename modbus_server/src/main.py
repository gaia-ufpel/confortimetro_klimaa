from pyModbusTCP.server import ModbusServer, DataBank, ClientInfo
import os
import logging

os.makedirs("/var/log/modbus_server")
HOST = os.getenv('MODBUS_HOST')
PORT = os.getenv('MODBUS_PORT')
logging.basicConfig(filename="/var/log/modbus_server/logs.log", format='%(asctime)s - %(message)s', datefmt='%d-%b-%y %H:%M:%S')

class DataloggerServer:
    def __init__(self, host, port):
        self._server = ModbusServer(host=host, port=port, no_block=True)
        self._db = DataBank
    
    def run(self):
        self._server.start()
        logging.info("Server started")

    def read_last_power_on(self):
        self._db.read


if __name__ == "__main__":
    pass
    



