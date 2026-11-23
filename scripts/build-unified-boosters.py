"""AETHERIUM — three packs, one immutable logo, frame, foil and footer.
Only the illustration inside the frame and the collection title vary.
Existing artwork remains the source; originals are never overwritten.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

BASE=Path("assets/boosters")
MASTER=BASE/"aetherium-booster-master-v1.webp"
SIZE=(640,1040)
PACKS=(
 ("origines-reliquaire-unified-v4.webp","origines-unified-v5.webp","ORIGINES",(90,338,551,695)),
 ("reflets-brises-reliquaire-unified-v4.webp","reflets-brises-unified-v5.webp","REFLETS BRISÉS",(90,331,551,700)),
 ("au-dela-du-verre-reliquaire-v3.webp","au-dela-du-verre-unified-v5.webp","AU-DELÀ DU VERRE",(90,266,551,696)),
)

def art_mask(image):
 rgb=np.asarray(image.convert("RGB"))
 r,g,b=[rgb[:,:,i].astype("int16") for i in range(3)]
 binary=((r<31)&(g<92)&(b>r+17)&(b>g+12)&(b>23)).astype("uint8")
 binary[:207,:]=0;binary[705:,:]=0;binary[:,:65]=0;binary[:,582:]=0
 count,labels,stats,_=cv2.connectedComponentsWithStats(binary,8)
 seed=labels[440,320]
 assert seed and stats[seed,cv2.CC_STAT_AREA]>180000,"Empty window changed"
 mask=(labels==seed).astype("uint8")*255
 contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
 cv2.drawContours(mask,contours,-1,255,-1)
 mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
 mask=cv2.erode(mask,np.ones((3,3),np.uint8))
 return Image.fromarray(mask,"L").filter(ImageFilter.GaussianBlur(.7))

def title_image(text):
 # One fixed serif, one fixed 44px cap size and one gold/shadow treatment.
 font_file="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
 if not Path(font_file).exists():
  font_file="/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf"
 font=ImageFont.truetype(font_file,44)
 w,h=500,74
 bbox=ImageDraw.Draw(Image.new("RGBA",(1,1))).textbbox((0,0),text,font=font,stroke_width=1)
 tw=bbox[2]-bbox[0];th=bbox[3]-bbox[1]
 layer=Image.new("RGBA",(max(w,tw+12),h),(0,0,0,0))
 draw=ImageDraw.Draw(layer)
 draw.text(((layer.width-tw)/2-bbox[0],(h-th)/2-bbox[1]),text,font=font,
           fill=(240,187,94),stroke_width=1,stroke_fill=(58,29,34))
 if layer.width>w:
  layer=layer.resize((w-20,h),Image.Resampling.LANCZOS)
 elif tw>w-20:
  layer=layer.resize((w-20,h),Image.Resampling.LANCZOS)
 a=layer.getchannel("A")
 shadow=Image.new("RGBA",layer.size,(21,8,30,0))
 shadow.putalpha(a.filter(ImageFilter.GaussianBlur(2)).point(lambda z:int(z*.80)))
 final=Image.new("RGBA",layer.size,(0,0,0,0))
 final.alpha_composite(shadow,(0,2))
 final.alpha_composite(layer)
 return final

def build():
 master=Image.open(MASTER).convert("RGBA")
 assert master.size==SIZE
 mask=art_mask(master)
 destbox=(76,224,563,692)
 for source_name,dest_name,title,crop in PACKS:
  src=Image.open(BASE/source_name).convert("RGBA")
  assert src.size==SIZE
  art=ImageOps.fit(src.crop(crop),(destbox[2]-destbox[0],destbox[3]-destbox[1]),
                   Image.Resampling.LANCZOS,centering=(.5,.48))
  art_layer=Image.new("RGBA",SIZE,(0,0,0,0))
  art_layer.paste(art,destbox[:2])
  out=master.copy()
  out.paste(art_layer,(0,0),mask)
  label=title_image(title)
  out.alpha_composite(label,(int((640-label.width)/2),724))
  path=BASE/dest_name
  out.save(path,"WEBP",quality=91,method=6,exact=True)
  assert Image.open(path).size==SIZE and 65000<path.stat().st_size<700000
  print(dest_name,path.stat().st_size,title)
if __name__=="__main__":build()
