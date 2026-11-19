#!/usr/bin/env python3
"""Build real, independent WebP RGBA layers for Aetherium's Vyrath V3.

The source HD artwork is read locally from the repository, never regenerated.
The reconstructed background is an artistic technical approximation of regions
hidden by the dragon; the original source is retained as a fidelity fallback.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/cards/vyrath-fleau-celeste.webp"
DEST = ROOT / "assets/cards/holo/vyrath"
REF_W, REF_H = 1138, 1382


def polygon_mask(size, polygons):
    w, h = size
    out = np.zeros((h, w), np.uint8)
    sx, sy = w / REF_W, h / REF_H
    for polygon in polygons:
        vertices = np.array(
            [[round(x * sx), round(y * sy)] for x, y in polygon],
            dtype=np.int32,
        )
        cv2.fillPoly(out, [vertices], 255)
    return out


# Artist-directed broad shapes. GrabCut tightens edges against the approved
# original palette. Separate large connected features: wing, head, body, claws.
SUBJECT_ROUGH = [
    # Sail-like left wing, including its tip and lower membrane.
    [
        (0, 91), (93, 79), (207, 74), (266, 58), (301, 34),
        (343, 35), (376, 48), (420, 69), (428, 108), (391, 97),
        (363, 91), (322, 130), (278, 169), (241, 229), (219, 303),
        (216, 386), (248, 457), (278, 524), (324, 584), (386, 657),
        (421, 694), (383, 729), (315, 760), (247, 755), (194, 753),
        (123, 754), (62, 722), (0, 754), (0, 91)
    ],
    # Main body and head / translucent crest / chest / front claws.
    [
        (123, 1043), (177, 988), (224, 939), (194, 897),
        (236, 852), (200, 800), (234, 747), (272, 701),
        (335, 677), (325, 604), (310, 538), (328, 459),
        (307, 438), (344, 394), (324, 347), (358, 320),
        (343, 287), (397, 278), (390, 245), (437, 229),
        (420, 196), (454, 174), (450, 20), (477, 11),
        (509, 129), (579, 174), (635, 181), (649, 120),
        (698, 163), (692, 126), (741, 180), (761, 160),
        (794, 185), (832, 187), (879, 204), (900, 215),
        (956, 209), (1024, 220), (1048, 241), (1040, 284),
        (1014, 330), (989, 356), (978, 395), (980, 442),
        (1003, 465), (968, 485), (931, 463), (911, 440),
        (870, 445), (845, 470), (831, 515), (851, 568),
        (894, 652), (919, 739), (956, 872), (945, 999),
        (956, 1103), (1000, 1248), (918, 1275), (862, 1195),
        (815, 1178), (820, 1274), (750, 1286), (725, 1197),
        (690, 1163), (682, 1287), (620, 1296), (596, 1191),
        (562, 1162), (535, 1280), (469, 1296), (438, 1212),
        (349, 1184), (274, 1223), (202, 1233), (137, 1204),
        (83, 1187), (90, 1110), (123, 1043)
    ],
    # Tail and near-side wing membrane that join the shoulder.
    [
        (0, 654), (39, 599), (86, 526), (130, 479),
        (189, 471), (230, 516), (290, 575), (329, 638),
        (414, 659), (482, 706), (547, 786), (535, 879),
        (462, 943), (362, 970), (250, 961), (171, 905),
        (89, 821), (0, 779), (0, 654)
    ],
]
# Additional reliable interior "sure dragon" pixels. This stops the near
# monochromatic purple shadows being absorbed into the similarly purple sky.
SUBJECT_CORE = [
    [(525, 340), (615, 300), (784, 285), (920, 274), (949, 303),
     (892, 341), (820, 390), (736, 446), (667, 522), (616, 621),
     (586, 731), (535, 795), (470, 779), (458, 653),
     (460, 545), (477, 431)],
    [(418, 766), (537, 715), (651, 751), (750, 859), (824, 1043),
     (760, 1134), (682, 1104), (584, 1060), (473, 1080),
     (391, 1097), (300, 1049), (286, 938)],
    [(34, 163), (133, 129), (221, 106), (257, 114), (196, 210),
     (169, 340), (158, 457), (113, 536), (43, 594), (20, 493)],
]
# Scene objects for a distinct middle plane, not part of the dragon.
MIDGROUND_ROUGH = [
    [(1039, 471), (1083, 447), (1121, 520), (1138, 569),
     (1138, 1330), (999, 1326), (941, 1237), (937, 1092),
     (876, 1046), (857, 931), (872, 789), (872, 645),
     (924, 605), (987, 600), (1039, 471)],
    [(0, 919), (72, 896), (153, 942), (214, 1004),
     (296, 1149), (375, 1222), (464, 1310), (498, 1382),
     (0, 1382), (0, 919)],
]


def soften_alpha(mask: np.ndarray) -> np.ndarray:
    """One-pixel antialiasing (not blurring the pixel-art illustration)."""
    return cv2.GaussianBlur(mask, (3, 3), .48)


def build_subject(rgb: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    rough = polygon_mask((w, h), SUBJECT_ROUGH)
    core = polygon_mask((w, h), SUBJECT_CORE)
    # Probable background in a 20px region outside the hand-traced outline
    # gives GrabCut freedom to follow real pixel edges without wandering.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (29, 29))
    padded = cv2.dilate(rough, kernel)
    labels = np.full((h, w), cv2.GC_BGD, np.uint8)
    labels[padded > 0] = cv2.GC_PR_BGD
    labels[rough > 0] = cv2.GC_PR_FGD
    labels[core > 0] = cv2.GC_FGD
    # Artwork contains strong edge contrast. GrabCut refines outlines, but
    # preserve hand-authored sure-foreground when colors resemble the sky.
    bg = np.zeros((1, 65), np.float64)
    fg = np.zeros((1, 65), np.float64)
    try:
        cv2.grabCut(rgb[:, :, ::-1].copy(), labels, None, bg, fg, 3, cv2.GC_INIT_WITH_MASK)
        selected = np.where(
            (labels == cv2.GC_FGD) | (labels == cv2.GC_PR_FGD), 255, 0
        ).astype(np.uint8)
        # Keep the high-contrast, small separated spikes that GrabCut sees.
        selected = cv2.morphologyEx(
            selected, cv2.MORPH_CLOSE,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        )
        selected[core > 0] = 255
        return soften_alpha(selected)
    except cv2.error as exc:
        print("GrabCut could not refine; retaining rough mask:", exc)
        return soften_alpha(rough)


def build_magic(size: tuple[int, int]) -> Image.Image:
    """Pixel-perfect sparkles on an independent alpha plane."""
    w, h = size
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    sx, sy = w / REF_W, h / REF_H
    stars = [
        (293, 238, 11), (293, 379, 11), (851, 514, 13),
        (639, 32, 9), (451, 20, 5), (1011, 165, 5),
        (879, 36, 5), (813, 80, 4), (1080, 16, 4),
        (1084, 397, 4), (113, 254, 5), (176, 72, 4),
        (610, 676, 6), (795, 1010, 5), (78, 950, 5),
        (244, 1225, 5), (922, 1105, 6),
    ]
    for x, y, length in stars:
        x, y = int(x * sx), int(y * sy)
        s = max(2, int(length * min(sx, sy)))
        draw.rectangle((x - s, y, x + s, y), fill=(255, 238, 177, 230))
        draw.rectangle((x, y - s, x, y + s), fill=(128, 244, 255, 220))
        draw.rectangle((x - 2, y - 2, x + 2, y + 2), fill=(255, 255, 235, 255))
    return out


def save_webp(rgba: np.ndarray | Image.Image, name: str):
    if isinstance(rgba, Image.Image):
        image = rgba
    else:
        image = Image.fromarray(rgba, "RGBA")
    image.save(DEST / name, "WEBP", lossless=True, method=5)
    print(name, image.size, (DEST / name).stat().st_size, "bytes")


def generate():
    original = np.array(Image.open(SOURCE).convert("RGB"))
    h, w = original.shape[:2]
    print("Source:", SOURCE, "size:", (w, h))
    DEST.mkdir(parents=True, exist_ok=True)

    subject = build_subject(original)
    # Regions isolated as architecture and vegetation create a second
    # physically moving plane. No dragon pixel should be on this plane.
    rough_mid = polygon_mask((w, h), MIDGROUND_ROUGH)
    middle = np.where(subject > 32, 0, rough_mid).astype(np.uint8)
    middle = soften_alpha(middle)

    # The dragon is removed from the background. Reconstruct the exposed
    # pixels; hidden sections do not need perfect semantic restoration.
    to_rebuild = cv2.dilate(
        np.maximum(subject, middle),
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21))
    )
    inpaint = cv2.inpaint(original[:, :, ::-1].copy(), to_rebuild, 4, cv2.INPAINT_TELEA)
    rebuilt = inpaint[:, :, ::-1].copy()

    # Opaque environment. The player cannot reveal a double of the dragon.
    backdrop = np.dstack((rebuilt, np.full((h, w), 255, np.uint8)))
    mid = np.dstack((original, middle))
    creature = np.dstack((original, subject))
    save_webp(backdrop, "background.webp")
    save_webp(mid, "midground.webp")
    save_webp(creature, "subject.webp")
    save_webp(build_magic((w, h)), "magic.webp")

    # Static rebuilt composite for debugging segmentation drift.
    composite = Image.fromarray(backdrop, "RGBA")
    composite.alpha_composite(Image.fromarray(mid, "RGBA"))
    composite.alpha_composite(Image.fromarray(creature, "RGBA"))
    composite.save(DEST / "composite-preview.webp", "WEBP", quality=92, method=5)
    print("Composite ready; original remains authoritative for static fallback.")


def verify():
    dims = Image.open(SOURCE).size
    for name in ("background.webp", "midground.webp", "subject.webp", "magic.webp"):
        with Image.open(DEST / name) as img:
            assert img.size == dims, f"Dimension mismatch: {name}"
            assert img.mode in ("RGBA", "RGB"), f"Unsupported color model: {name}"
            if name != "background.webp":
                assert img.getchannel("A").getextrema()[0] == 0, f"No alpha: {name}"
            print("OK:", name, img.size, img.mode)
    print("Vyrath V3 assets validated.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if args.verify:
        verify()
    else:
        generate()
