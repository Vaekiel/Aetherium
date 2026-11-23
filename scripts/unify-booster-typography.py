"""Correct only the printed season/count footers on existing AETHERIUM wrappers.

Reuse the exact metallic glyph artwork from approved Au-delà du Verre,
then replace the old footer words on Origines and Reflets Brisés.
No collectible art, ornamental borders, or names are redrawn.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageFilter

BASE=Path("assets/boosters")
REFERENCE=BASE/"au-dela-du-verre-reliquaire-v3.webp"
SOURCE_REGIONS=((145,829,282,860),(348,829,494,860))
PACKS=(
 ("origines-reliquaire-normalized-v2.webp","origines-reliquaire-unified-v4.webp",
  ((171,851,301,881),(332,851,479,881)),((232,868),(411,868))),
 ("reflets-brises-reliquaire-normalized-v2.webp","reflets-brises-reliquaire-unified-v4.webp",
  ((158,814,306,851),(332,814,485,851)),((229,835),(411,835))),
)

def gold_mask(rgb):
 r,g,b=[rgb[:,:,channel].astype("int16") for channel in range(3)]
 foil=(r>130)&(g>90)&(r*100>b*115)&(r>=g)
 cream=(r>165)&(g>155)&(b>128)&(r>=b-2)
 return (foil|cream).astype("uint8")*255

source=np.asarray(Image.open(REFERENCE).convert("RGBA"))
assert source.shape==(1040,640,4)
lettering=[]
for x1,y1,x2,y2 in SOURCE_REGIONS:
 crop=source[y1:y2,x1:x2].copy()
 mask=gold_mask(crop[:,:,:3])
 mask=cv2.GaussianBlur(mask,(3,3),.5)
 crop[:,:,3]=(crop[:,:,3].astype("float32")*(mask.astype("float32")/255)).astype("uint8")
 lettering.append(Image.fromarray(crop))

for filename,destination,old_rois,positions in PACKS:
 original=np.array(Image.open(BASE/filename).convert("RGBA"))
 assert original.shape==(1040,640,4)
 img_rgb=original[:,:,:3].copy()
 erase_mask=np.zeros((1040,640),dtype=np.uint8)
 for x1,y1,x2,y2 in old_rois:
  erase_mask[y1:y2,x1:x2]=gold_mask(img_rgb[y1:y2,x1:x2])
 # Dilation includes dark strokes and shadow; inpainting preserves plaque texture.
 erase_mask=cv2.dilate(erase_mask,np.ones((9,9),np.uint8),iterations=1)
 bgr=cv2.cvtColor(img_rgb,cv2.COLOR_RGB2BGR)
 repaired=cv2.cvtColor(cv2.inpaint(bgr,erase_mask,5,cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB)
 original[:,:,:3]=repaired
 art=Image.fromarray(original)
 for (cx,cy),letters in zip(positions,lettering):
  x=round(cx-letters.width/2);y=round(cy-letters.height/2)
  shadow_alpha=letters.getchannel("A").filter(ImageFilter.GaussianBlur(1.2)).point(lambda z:int(z*.58))
  shadow=Image.new("RGBA",letters.size,(5,3,15,0))
  shadow.putalpha(shadow_alpha)
  art.alpha_composite(shadow,(x+1,y+2))
  art.alpha_composite(letters,(x,y))
 outfile=BASE/destination
 art.save(outfile,"WEBP",quality=91,method=6,exact=True)
 assert Image.open(outfile).size==(640,1040)
 print(f"Harmonized {outfile}, {outfile.stat().st_size} bytes: SAISON 1 + 5 CARTES")
