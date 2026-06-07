FROM python:3.12-slim

WORKDIR /server

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

RUN chmod +x entry_point.sh

EXPOSE 8000

ENTRYPOINT [ "./entry_point.sh" ]
