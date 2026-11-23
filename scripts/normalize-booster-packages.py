"""Normalize the two approved Aetherium booster designs for a shared physical size.
Remove surrounding black scan margins and softly fade matte at the edges, without
changing the lettering or collectible art. The originals remain available.
"""
from pathlib import Path
from PIL import Image, ImageChops

BASE=Path('assets/boosters')
TARGET=(640,1040)
PACKS=(
 ('origines-reliquaire-v1.webp','origines-reliquaire-normalized-v2.webp',(30,0,701,1064),(16,16,11,12)),
 ('reflets-brises-pack-pixel-hd-v2.webp','reflets-brises-reliquaire-normalized-v2.webp',(124,11,963,1405),(24,24,15,22)),
)

def edge_alpha(size,left,right,top,bottom):
 width,height=size
 xm=Image.new('L',(width,1))
 xm.putdata([round(255*min(1,(x+.5)/left,(width-x-.5)/right)) for x in range(width)])
 ym=Image.new('L',(1,height))
 ym.putdata([round(255*min(1,(y+.5)/top,(height-y-.5)/bottom)) for y in range(height)])
 return ImageChops.multiply(xm.resize(size,Image.Resampling.NEAREST),ym.resize(size,Image.Resampling.NEAREST))

for source,target,box,feather in PACKS:
 artwork=Image.open(BASE/source).convert('RGBA')
 assert artwork.width>=box[2] and artwork.height>=box[3],f'Input dimensions changed: {source} {artwork.size}'
 artwork=artwork.crop(box)
 artwork.putalpha(ImageChops.multiply(artwork.getchannel('A'),edge_alpha(artwork.size,*feather)))
 artwork=artwork.resize(TARGET,Image.Resampling.LANCZOS)
 output=BASE/target
 artwork.save(output,format='WEBP',quality=89,method=6,exact=True)
 check=Image.open(output).convert('RGBA')
 assert check.size==TARGET and check.getpixel((0,0))[3]<30
 assert check.getpixel((TARGET[0]//2,TARGET[1]//2))[3]==255
 print(source,'=>',target,check.size,output.stat().st_size,'bytes')
