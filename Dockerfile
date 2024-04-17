FROM alpine:latest AS build

RUN apk update && apk add git
RUN git clone https://github.com/orlb/fossflix.git /fossflix

FROM node

# Copy ffmpeg binaries. See usage https://hub.docker.com/r/mwader/static-ffmpeg/
COPY --from=mwader/static-ffmpeg:7.0 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:7.0 /ffprobe /usr/local/bin/

COPY --from=build /fossflix /fossflix

WORKDIR /fossflix
RUN sed -i 's/mongodb:\/\/127.0.0.1:27017/mongodb:\/\/mongo:27017/g' \
    config/default.json
RUN npm install
CMD npm run test
