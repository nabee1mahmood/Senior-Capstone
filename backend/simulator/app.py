from prometheus_client import start_http_server, Gauge
import time
import random

# simple test metric
temperature = Gauge("homesense_temperature_f", "Temperature in Fahrenheit", ["room"])
humidity = Gauge("homesense_humidity_percent", "Humidity percentage", ["room"])
smoke_level = Gauge("homesense_smoke_level", "Smoke level", ["location"])
water_leak = Gauge("homesense_water_leak_detected", "1 if leak detected, else 0", ["location"])
water_heater_vibration = Gauge(
    "homesense_water_heater_vibration",
    "Water heater vibration level",
    ["location"]
)

def generate_data():
    rooms = ["living_room", "kitchen", "bedroom"]

    while True:
        for room in rooms:
            temp = random.uniform(65, 80)
            hum = random.uniform(35, 55)

            temperature.labels(room=room).set(temp)
            humidity.labels(room=room).set(hum)

            print(f"{room}: temp={round(temp,2)} humidity={round(hum,2)}")


        locations = ["kitchen", "bathroom", "water_heater"]

        for loc in locations:
            # 5% chance of leak
            leak = 1 if random.random() < 0.05 else 0
            water_leak.labels(location=loc).set(leak)

            if leak == 1:
                print(f"LEAK DETECTED at {loc}!")



        for loc in locations:
            # normal low smoke
            smoke = random.uniform(0, 10)

            # small chance of spike (danger event)
            if random.random() < 0.1:
                smoke = random.uniform(60, 100)
                print(f"SMOKE SPIKE at {loc}!")

            smoke_level.labels(location=loc).set(smoke)



        for loc in locations:
            vibration = random.uniform(0.1, 1.5)

            if loc == "water_heater" and random.random() < 0.1:
                vibration = random.uniform(3.0, 6.0)
                print(f"⚠️ HIGH VIBRATION at {loc}!")

            water_heater_vibration.labels(location=loc).set(vibration)


        time.sleep(2)

if __name__ == "__main__":
    start_http_server(8000)
    print("Running on http://localhost:8000/metrics")
    generate_data()