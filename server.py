import os
import mimetypes
from datetime import datetime
from socket import *

HOST = 'localhost'
SERVER_PORT = 8080
MESSAGE_RECV = 1024
PAGE_PATH = './www'
LOGGING_FILE = 'log.txt'

# Creazione socket TCP
serverSocket = socket(AF_INET, SOCK_STREAM)
serverSocket.bind((HOST, SERVER_PORT))
serverSocket.listen(1)

print('Il server è attivo su http://localhost:', SERVER_PORT)
#aiuta a distinguere tipo di MiME
def get_content_type(file_path):
    content_type, _ = mimetypes.guess_type(file_path)
    return content_type or 'application/octet-stream'

def log_request(method, path, client_ip):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_line = f"[{timestamp}] {client_ip} {method} {path}\n"
    with open(LOGGING_FILE, 'a') as f:
        f.write(log_line)
    print(log_line, end='')

#serve attivata
while True:
    print('In attesa di una connessione...')
    connectionSocket, addr = serverSocket.accept()
    print("Connessione da", addr)
    client_ip = addr[0]  # Solo IP

    try:
        message = connectionSocket.recv(MESSAGE_RECV).decode()

        if len(message.split()) > 1:
            method = message.split()[0]
            path = message.split()[1]
            filename = path

            # salvare log della richiesta
            log_request(method, path, client_ip)

            # Gestione del file richiesto
            if filename == '/':
                filename = '/index.html'
                status_line = b"HTTP/1.1 200 OK\r\n"
            else:
                #richiesta diretta (indirzzo assoluto) 
                filepath = os.path.join(PAGE_PATH, path.lstrip('/'))
                if os.path.exists(filepath) and not os.path.isdir(filepath):
                    filename = path
                    status_line = b"HTTP/1.1 200 OK\r\n"
                else:
                    filename = '/404.html'
                    status_line = b"HTTP/1.1 404 Not Found\r\n"

            filepath = os.path.join(PAGE_PATH, filename.lstrip('/'))

            try:
                with open(filepath, 'rb') as file:
                    content = file.read()
                    content_type = get_content_type(filepath)
            except Exception as e:
                content = f"<h1>Server Error</h1><p>{e}</p>".encode()
                content_type = 'text/html'
            #set header
            headers = status_line + f"Content-Type: {content_type}\r\nContent-Length: {len(content)}\r\n\r\n".encode()
            connectionSocket.sendall(headers + content)
    except Exception as e:
        print("Errore:", e)
    finally:
        connectionSocket.close()
