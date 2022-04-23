# Intro Build

The X-Quest video is basically just [hubble space footage](https://www.youtube.com/watch?v=99uWHUQ-dC0) that's convereted into ascii and processed into frames that fits in the X-Quest screen. Pretty cool right?

Instructions to rebuild are below. The `video-to-ascii` library only worked with v1.2.8 so make sure you don't get the latest version.

1. `pip3 install "video-to-ascii == 1.2.8"` 
2. `video-to-ascii -f x.mp4 -o x.sh`
3. `video-to-ascci -f space-trimmed.mp4 -o space.sh`
4. `python3 ascii-video-parser.py`