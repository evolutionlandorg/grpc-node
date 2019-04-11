import os
import subprocess
import time
from threading import Timer


def main():
    log_file = "rpc.log"
    while log_file:
        exists = os.path.isfile(log_file)
        if exists:
            tail_log(log_file)
        else:
            print("wait for log ........")
            time.sleep(2)


def tail_log(log_file):
    p = subprocess.Popen(['tail', '-f', log_file])
    my_timer = Timer(30, lambda process: process.kill(), [p])
    try:
        my_timer.start()
        p.communicate()
    finally:
        my_timer.cancel()


if __name__ == "__main__":
    main()
