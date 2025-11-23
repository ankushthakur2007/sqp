
function generateO() {
    const coords = [];
    const center = { x: 50, y: 50 };

    // Outer ring (16 points)
    const r1 = 42;
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * 2 * Math.PI - Math.PI / 2; // Start from top
        coords.push({
            top: (center.y + r1 * Math.sin(angle)).toFixed(1) + '%',
            left: (center.x + r1 * Math.cos(angle)).toFixed(1) + '%'
        });
    }

    // Inner ring (10 points)
    const r2 = 28;
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * 2 * Math.PI - Math.PI / 2;
        coords.push({
            top: (center.y + r2 * Math.sin(angle)).toFixed(1) + '%',
            left: (center.x + r2 * Math.cos(angle)).toFixed(1) + '%'
        });
    }

    // Middle ring filler (5 points) - placed in gaps of inner ring?
    // Or maybe just a very small inner ring?
    // Let's do a middle ring of 5 points
    const r3 = 15;
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
        coords.push({
            top: (center.y + r3 * Math.sin(angle)).toFixed(1) + '%',
            left: (center.x + r3 * Math.cos(angle)).toFixed(1) + '%'
        });
    }

    return coords;
}

function generateS() {
    const coords = [];

    // We will construct the S from 31 points manually to ensure good shape.
    // S is composed of:
    // 1. Top Arc (Right to Left)
    // 2. Middle Diagonal/Curve (Left to Right)
    // 3. Bottom Arc (Right to Left)

    const points = [
        // Top End (Right)
        { x: 85, y: 15 },
        { x: 82, y: 10 },
        { x: 70, y: 5 },
        { x: 50, y: 5 },
        { x: 30, y: 5 },
        { x: 18, y: 10 },
        { x: 15, y: 20 },

        // Top Curve down to middle
        { x: 15, y: 30 },
        { x: 20, y: 38 },
        { x: 30, y: 42 },
        { x: 40, y: 45 },

        // Center
        { x: 50, y: 50 },

        // Middle Curve down to bottom (Reflected roughly)
        { x: 60, y: 55 },
        { x: 70, y: 58 },
        { x: 80, y: 62 },
        { x: 85, y: 70 },

        // Bottom Curve
        { x: 85, y: 80 },
        { x: 82, y: 90 },
        { x: 70, y: 95 },
        { x: 50, y: 95 },
        { x: 30, y: 95 },
        { x: 18, y: 90 },
        { x: 15, y: 85 },

        // Fillers to make it look solid (31 total needed, we have 23 so far)

        // Top inner fill
        { x: 60, y: 12 },
        { x: 40, y: 12 },
        { x: 25, y: 25 },

        // Bottom inner fill
        { x: 75, y: 75 },
        { x: 60, y: 88 },
        { x: 40, y: 88 },

        // Extra density
        { x: 35, y: 35 }, // Upper mid
        { x: 65, y: 65 }, // Lower mid
    ];

    points.forEach(p => {
        coords.push({
            top: p.y + '%',
            left: p.x + '%'
        });
    });

    return coords;
}

console.log("export const ALL_S_COORDS = " + JSON.stringify(generateS(), null, 2) + ";");
console.log("export const ALL_O_COORDS = " + JSON.stringify(generateO(), null, 2) + ";");
