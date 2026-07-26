FROM python:3.12-slim

# /server - makes the below path an absolute one. creates only if necessary, setting it as the cwd
# right off the container's filesystem root - always means the same thing

# server - (without slashes) relative to whatever the previous (WORKDIR or / if none was set) was
# If you had WORKDIR /server earlier, with WORKDIR server, you'd end up at /server/server
WORKDIR /server

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

RUN chmod +x entry_point.sh

EXPOSE 8000

ENTRYPOINT [ "./entry_point.sh" ]
