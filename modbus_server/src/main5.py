import threading
import time
from pymodbus.server import StartTcpServer
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusServerContext

# Função para ler e atualizar os registros
def read_registers():
    global block
    while True:
        # Aqui você pode implementar a lógica para ler os registros
        # Substitua isso pelo seu próprio código para ler os valores dos registros
        # Neste exemplo, apenas incrementamos um valor de registro a cada chamada
        time.sleep(5)
        print(block.getValues(64020, 1))
          # Aguarda 5 segundos antes de ler novamente os registros

block = ModbusSequentialDataBlock(0, [0x00] * 65536)

# Crie um contexto de servidor Modbus
store = ModbusServerContext(slaves={0: block}, single=True)

# Crie uma memória de dados Modbus

# Adicione a memória de dados ao contexto do servidor

# Inicie o servidor Modbus TCP na porta 5020 (você pode escolher qualquer porta que desejar)

# Crie uma thread separada para ler os registros periodicamente
print('Starting read thread')
read_thread = threading.Thread(target=read_registers)
read_thread.daemon = True
read_thread.start()

server = StartTcpServer(context=store, address=("0.0.0.0", 5901))

# Mantenha o servidor em execução indefinidamente
while True:
    pass
