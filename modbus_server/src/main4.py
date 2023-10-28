import argparse
import socket

parser = argparse.ArgumentParser()
parser.add_argument('-ip', '--ip', help='ip adrress which the socket will bind', default='127.0.0.1')
parser.add_argument('-p', '--port', type=int, help='port which the socket will bind', default='5656')
args = vars(parser.parse_args())

sock = socket.socket()
sock.bind((args['ip'], args['port']))
sock.listen(3)

while True:
    con, addr = sock.accept()
    print('connected with {}'.format(addr))
    
    while True:
        data = con.recv(1024)
        print(f'received: {data}')

        s_data  = input('>> Send: ')
        con.send(s_data.encode())

sock.close()