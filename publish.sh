docker buildx build --platform linux/amd64,linux/arm64 --push -t  hqwuzhaoyi/subweb .

docker buildx imagetools inspect hqwuzhaoyi/subweb
