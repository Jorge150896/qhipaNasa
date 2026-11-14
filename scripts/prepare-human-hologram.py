"""Convert MakeHuman's CC0 base.obj body group to a normalized, self-contained GLB.
Usage: python3 scripts/prepare-human-hologram.py /path/to/base.obj
No MakeHuman program code or runtime dependency is included.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--target', type=Path)
parser.add_argument('--variant', choices=['neutral', 'masculine', 'feminine'], default='neutral')
args = parser.parse_args()
source = args.source
vertices, faces = [], []
group = ''
for line in source.read_text().splitlines():
    if line.startswith('v '):
        vertices.append(tuple(map(float, line.split()[1:4])))
    elif line.startswith('g '):
        group = line[2:].strip()
    elif line.startswith('f ') and group == 'body':
        indices = [int(value.split('/')[0]) - 1 for value in line.split()[1:]]
        faces.extend((indices[0], indices[i], indices[i + 1]) for i in range(1, len(indices) - 1))
if args.target:
    for line in args.target.read_text().splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        index, dx, dy, dz = line.split()
        index = int(index)
        vertices[index] = tuple(vertices[index][axis] + float(delta) for axis, delta in enumerate((dx, dy, dz)))
used = sorted({index for face in faces for index in face})
lookup = {old: new for new, old in enumerate(used)}
y_min = min(vertices[index][1] for index in used)
y_max = max(vertices[index][1] for index in used)
scale = 2.7 / (y_max - y_min)
positions = [(vertices[i][0] * scale, (vertices[i][1] - (y_min + y_max) / 2) * scale, vertices[i][2] * scale) for i in used]
faces = [tuple(lookup[i] for i in face) for face in faces]
normals = [[0., 0., 0.] for _ in positions]
for a, b, c in faces:
    u = [positions[b][i] - positions[a][i] for i in range(3)]
    v = [positions[c][i] - positions[a][i] for i in range(3)]
    normal = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
    for index in (a, b, c):
        for axis in range(3):
            normals[index][axis] += normal[axis]
for index, normal in enumerate(normals):
    length = math.sqrt(sum(value*value for value in normal)) or 1
    normals[index] = [value / length for value in normal]
chunks = [struct.pack('<' + 'f' * (len(positions)*3), *(value for point in positions for value in point)), struct.pack('<' + 'f' * (len(normals)*3), *(value for point in normals for value in point)), struct.pack('<' + 'H' * (len(faces)*3), *(value for face in faces for value in face))]
views = []
offset = 0
for index, chunk in enumerate(chunks):
    views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(chunk), 'target': 34963 if index == 2 else 34962})
    offset += len(chunk)
binary = b''.join(chunks)
binary += b'\0' * (-len(binary) % 4)
document = {'asset': {'version': '2.0', 'generator': 'ASTRA CC0 body conversion', 'copyright': 'MakeHuman base mesh, CC0 1.0 Universal'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'name': 'HumanBody', 'mesh': 0}], 'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1}, 'indices': 2}]}], 'buffers': [{'byteLength': len(binary)}], 'bufferViews': views, 'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': len(positions), 'type': 'VEC3', 'min': [min(point[i] for point in positions) for i in range(3)], 'max': [max(point[i] for point in positions) for i in range(3)]}, {'bufferView': 1, 'componentType': 5126, 'count': len(normals), 'type': 'VEC3'}, {'bufferView': 2, 'componentType': 5123, 'count': len(faces)*3, 'type': 'SCALAR'}]}
encoded = json.dumps(document, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
result = struct.pack('<III', 0x46546c67, 2, 12 + 8 + len(encoded) + 8 + len(binary)) + struct.pack('<II', len(encoded), 0x4e4f534a) + encoded + struct.pack('<II', len(binary), 0x004e4942) + binary
filename = 'human-hologram.glb' if args.variant == 'neutral' else f'human-hologram-{args.variant}.glb'
output = Path(__file__).resolve().parents[1] / 'frontend/public/models' / filename
output.write_bytes(result)
print(f'{output.name}: {len(positions)} vertices, {len(faces)} triangles, {len(result)} bytes')
print('Original OBJ SHA256:', hashlib.sha256(source.read_bytes()).hexdigest())

if args.target:
    print("Target SHA256:", hashlib.sha256(args.target.read_bytes()).hexdigest())
