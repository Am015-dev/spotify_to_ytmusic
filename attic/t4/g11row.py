import sys
from PIL import Image
fs=sys.argv[2:];c=Image.new('RGB',(640*len(fs),400),(235,240,245))
for i,f in enumerate(fs):
  b=Image.open(f).convert('RGBA');c.paste(b,(640*i,0),b)
c.save(sys.argv[1])
