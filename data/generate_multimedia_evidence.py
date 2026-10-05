"""Generates real simulated multimedia evidence artifacts:
- Photo of Workstation-01 desk
- CCTV surveillance video of Server Room
- Photo of recovered physical USB drive
- Forensic intake report document

Also processes the photo with OpenCV to produce edge & keypoint forensic analysis visuals.
"""

import os
import sys
from pathlib import Path
import cv2
import numpy as np

# Add forensic-engine/evidence-processing to path
sys.path.insert(0, str(Path("forensic-engine/evidence-processing")))
from processor import EvidenceProcessor


def create_photo_evidence():
    """Create a realistic synthetic photo of Workstation-01 desk."""
    img = np.zeros((720, 1280, 3), dtype=np.uint8)
    # Background wall (dark slate)
    img[:] = (35, 42, 48)

    # Office Desk surface
    cv2.rectangle(img, (100, 350), (1180, 700), (60, 75, 90), -1)
    cv2.rectangle(img, (100, 350), (1180, 700), (100, 120, 140), 3)

    # Computer Monitor
    cv2.rectangle(img, (350, 120), (930, 480), (20, 20, 25), -1)
    cv2.rectangle(img, (370, 140), (910, 450), (12, 18, 24), -1)
    cv2.rectangle(img, (350, 120), (930, 480), (180, 200, 220), 2)
    # Monitor stand
    cv2.rectangle(img, (600, 480), (680, 560), (40, 45, 50), -1)
    cv2.rectangle(img, (540, 560), (740, 580), (50, 55, 60), -1)

    # Terminal text on monitor screen
    cv2.putText(img, "CORP-DOMAIN AUTHENTICATION CONSOLE", (390, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 220, 255), 2)
    cv2.putText(img, "Host: WORKSTATION-01 | IP: 192.168.1.20", (390, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 120), 1)
    cv2.putText(img, "User: employee01 (Logged In 10:15:00 UTC)", (390, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(img, "WARNING: Obfuscated PowerShell execution detected", (390, 310), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 80, 255), 2)
    cv2.putText(img, "PID: 4912 -powershell.exe -enc SQBFAFgA...", (390, 350), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (100, 160, 255), 1)

    # Workstation PC Tower on desk
    cv2.rectangle(img, (960, 200), (1140, 620), (30, 35, 40), -1)
    cv2.rectangle(img, (960, 200), (1140, 620), (120, 130, 140), 2)
    # Front USB Ports with red LED
    cv2.rectangle(img, (1000, 260), (1050, 280), (10, 10, 10), -1)
    cv2.circle(img, (1080, 270), 6, (0, 0, 255), -1)  # Red Alert LED
    cv2.putText(img, "USB DRIVE INSERTED", (980, 320), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 180, 255), 1)

    # Evidence Marker Card on Desk
    cv2.rectangle(img, (160, 480), (320, 600), (240, 240, 245), -1)
    cv2.rectangle(img, (160, 480), (320, 600), (0, 0, 180), 3)
    cv2.putText(img, "EVIDENCE", (180, 520), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 180), 2)
    cv2.putText(img, "EVD-006", (180, 560), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(img, "Desk 14", (180, 590), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (80, 80, 80), 1)

    # Top banner / forensic timestamp
    cv2.rectangle(img, (0, 0), (1280, 50), (15, 20, 25), -1)
    cv2.putText(img, "FORENSIC CRIME SCENE PHOTOGRAPH | CASE-001 | 2026-10-04 10:16:00 UTC", (20, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 200), 2)

    return img


def create_usb_photo():
    """Create a photo of recovered physical USB drive evidence."""
    img = np.zeros((600, 800, 3), dtype=np.uint8)
    img[:] = (40, 45, 50)  # Evidence inspection mat

    # Grid lines on mat
    for x in range(0, 800, 50):
        cv2.line(img, (x, 0), (x, 600), (55, 60, 65), 1)
    for y in range(0, 600, 50):
        cv2.line(img, (0, y), (800, y), (55, 60, 65), 1)

    # USB Drive body
    cv2.rectangle(img, (250, 220), (550, 340), (15, 15, 20), -1)
    cv2.rectangle(img, (250, 220), (550, 340), (180, 190, 200), 3)
    # USB Metal connector
    cv2.rectangle(img, (150, 240), (250, 320), (160, 170, 180), -1)
    cv2.rectangle(img, (150, 240), (250, 320), (80, 90, 100), 2)
    cv2.rectangle(img, (180, 260), (210, 275), (30, 30, 30), -1)
    cv2.rectangle(img, (180, 285), (210, 300), (30, 30, 30), -1)

    # USB Label
    cv2.putText(img, "ULTRA-FAST 64GB", (280, 265), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
    cv2.putText(img, "S/N: 2026-XF88219", (280, 295), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 1)
    cv2.putText(img, "MALICIOUS STAGING PAYLOAD", (280, 325), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 80, 255), 1)

    # Evidence Tag
    cv2.rectangle(img, (80, 420), (720, 560), (245, 245, 240), -1)
    cv2.rectangle(img, (80, 420), (720, 560), (0, 0, 180), 3)
    cv2.putText(img, "PHYSICAL EVIDENCE CHAIN OF CUSTODY", (100, 455), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 180), 2)
    cv2.putText(img, "Evidence ID: EVD-008 | Type: Physical Media (USB)", (100, 485), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (10, 10, 10), 2)
    cv2.putText(img, "Location: Workstation-01 USB Port 2 | Collected By: Lead Digital Forensics Team", (100, 515), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (40, 40, 40), 1)
    cv2.putText(img, "Hash (Custody Seal): SHA-256 e8f4a1209b5523dc881a7042a19...", (100, 545), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (80, 80, 80), 1)

    return img


def create_cctv_video(output_path: Path):
    """Generate a realistic simulated CCTV video file with timestamp ticker."""
    fps = 15
    duration_sec = 6
    total_frames = fps * duration_sec
    width, height = 854, 480

    # Try mp4v or fallback to avc1
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

    if not out.isOpened():
        print(f"[WARN] VideoWriter failed with mp4v, trying MJPG...")
        fourcc = cv2.VideoWriter_fourcc(*"MJPG")
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

    for f_idx in range(total_frames):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Server room background (dim blue-gray)
        frame[:] = (25, 30, 40)

        # Hallway floor with perspective lines
        pts = np.array([[100, 480], [754, 480], [550, 200], [304, 200]], np.int32)
        cv2.fillPoly(frame, [pts], (45, 50, 60))

        # Server Rack Cabinets on both sides
        cv2.rectangle(frame, (20, 80), (260, 460), (18, 20, 24), -1)
        cv2.rectangle(frame, (20, 80), (260, 460), (80, 90, 110), 2)
        cv2.rectangle(frame, (594, 80), (834, 460), (18, 20, 24), -1)
        cv2.rectangle(frame, (594, 80), (834, 460), (80, 90, 110), 2)

        # Blinking LED lights on racks
        led_toggle = (f_idx // 5) % 2
        for r_y in range(120, 440, 40):
            cv2.circle(frame, (230, r_y), 4, (0, 255, 0) if led_toggle else (0, 180, 0), -1)
            cv2.circle(frame, (624, r_y), 4, (0, 160, 255) if not led_toggle else (0, 80, 255), -1)

        # Server Room Door at end of hallway
        cv2.rectangle(frame, (350, 160), (500, 360), (30, 35, 45), -1)
        cv2.rectangle(frame, (350, 160), (500, 360), (140, 150, 160), 2)
        cv2.putText(frame, "SRV-CORP-FILE", (360, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)

        # Badge Access Reader on door frame
        badge_active = (f_idx >= 30 and f_idx <= 60)
        cv2.rectangle(frame, (505, 240), (525, 270), (0, 255, 0) if badge_active else (0, 0, 255), -1)

        # Add simulated motion / figure near door during badge scan
        if badge_active:
            cv2.ellipse(frame, (430, 270), (25, 60), 0, 0, 360, (70, 75, 85), -1)
            cv2.circle(frame, (430, 195), 15, (90, 95, 105), -1)
            cv2.putText(frame, "BADGE SCAN: employee01", (320, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # CCTV OSD (On-Screen Display) Header
        cv2.rectangle(frame, (0, 0), (width, 40), (0, 0, 0), -1)
        sec_offset = f_idx / fps
        time_str = f"2026-10-04 10:21:{int(sec_offset):02d} UTC"
        cv2.putText(frame, f"CAM-04 SERVER ROOM ENTRANCE | {time_str} | REC [SIMULATED CCTV]", (15, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (0, 255, 0), 1)

        out.write(frame)

    out.release()
    print(f"[OK] Generated CCTV video at {output_path}")


def main():
    # Targets
    target_dirs = [
        Path("data/evidence"),
        Path("frontend/public/evidence"),
    ]
    for d in target_dirs:
        d.mkdir(parents=True, exist_ok=True)

    # 1. Photos
    workstation_img = create_photo_evidence()
    usb_img = create_usb_photo()

    for d in target_dirs:
        cv2.imwrite(str(d / "workstation_photo.jpg"), workstation_img)
        cv2.imwrite(str(d / "tampered_usb_drive.jpg"), usb_img)

    # 2. CCTV Video
    for d in target_dirs:
        create_cctv_video(d / "cctv_server_room.mp4")

    # 3. Report Document
    report_content = """================================================================================
CYBER INCIDENT INTAKE & FORENSIC EVIDENCE CUSTODY RECORD
Case Identifier: CASE-001
Title: Compromised Employee Account & Data Exfiltration
Investigating Authority: Lead Digital Forensics Team
================================================================================

1. INCIDENT OVERVIEW
At 2026-10-04 10:15:00 UTC, security operations detected unauthorized domain logon
events from IP 192.168.1.20 targeting user account employee01. Within 3 minutes,
obfuscated PowerShell activity was observed on WORKSTATION-01 followed by lateral
SMB connection to enterprise file server SRV-CORP-FILE.

2. EVIDENCE SEIZURE INVENTORY
- EVD-001: Authentication Log (auth.log) - Verified SHA-256
- EVD-002: Endpoint Process Log (endpoint.log) - Verified SHA-256
- EVD-003: Server Access Log (server.log) - Verified SHA-256
- EVD-004: File Audit Log (file_access.log) - Verified SHA-256
- EVD-005: Perimeter Firewall Log (firewall.log) - Verified SHA-256
- EVD-006: Scene Photograph (workstation_photo.jpg) - Desk 14 Physical Terminal
- EVD-007: CCTV Surveillance Footage (cctv_server_room.mp4) - Hallway Camera 04
- EVD-008: Physical Evidence (tampered_usb_drive.jpg) - Hardware Staging Media
- EVD-009: Intake Report Document (forensic_intake_report.txt)

3. INTEGRITY & CHAIN OF CUSTODY
All physical and digital artifacts have been cryptographically stamped with SHA-256
integrity hashes. Evidence markers have been placed in the 3D investigation environment.
"""
    for d in target_dirs:
        with open(d / "forensic_intake_report.txt", "w", encoding="utf-8") as f:
            f.write(report_content)

    # 4. Run real OpenCV processor on workstation_photo.jpg to export edge and keypoint analysis!
    processor = EvidenceProcessor(output_dir="data/processed/evidence")
    analysis = processor.process_image(
        target_dirs[0] / "workstation_photo.jpg",
        artifact_id="EVD-006",
        export_processed=True,
    )
    print(f"[OK] Processed EVD-006 with OpenCV: {analysis['opencv_analysis']}")

    # Copy processed analysis to frontend/public/evidence for direct UI viewing
    for extra in ["EVD-006_opencv_analysis.png", "EVD-006_edges.png"]:
        src = Path("data/processed/evidence") / extra
        if src.is_file():
            dst = Path("frontend/public/evidence") / extra
            with open(src, "rb") as sf, open(dst, "wb") as df:
                df.write(sf.read())
            print(f"[OK] Copied OpenCV analysis artifact {extra} to frontend public")


if __name__ == "__main__":
    main()
