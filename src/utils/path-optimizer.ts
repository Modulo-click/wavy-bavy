// ============================================================
// SVG Path Optimizer — Ramer-Douglas-Peucker Algorithm
// ============================================================

interface Point {
    x: number
    y: number
}

/**
 * Perpendicular distance from point to line segment (p1→p2).
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y

    if (dx === 0 && dy === 0) {
        // lineStart and lineEnd are the same point
        return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2)
    }

    const lengthSq = dx * dx + dy * dy
    const numerator = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x)
    return numerator / Math.sqrt(lengthSq)
}

/**
 * Ramer-Douglas-Peucker line simplification algorithm.
 * Reduces the number of points in a polyline while preserving shape.
 */
function rdpSimplify(points: Point[], epsilon: number): Point[] {
    if (points.length <= 2) return points

    // Find the point with maximum distance from the line (first→last)
    let maxDist = 0
    let maxIndex = 0

    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(points[i], points[0], points[points.length - 1])
        if (dist > maxDist) {
            maxDist = dist
            maxIndex = i
        }
    }

    // If max distance exceeds epsilon, recursively simplify
    if (maxDist > epsilon) {
        const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon)
        const right = rdpSimplify(points.slice(maxIndex), epsilon)
        return [...left.slice(0, -1), ...right]
    }

    // Below threshold — keep only endpoints
    return [points[0], points[points.length - 1]]
}

/**
 * Parse coordinate pairs from an SVG path string.
 * Extracts all (x, y) pairs in order of appearance.
 */
function extractPoints(path: string): Point[] {
    const points: Point[] = []
    const regex = /(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(path)) !== null) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) })
    }

    return points
}

/**
 * Rebuild a simplified SVG path from points.
 * Uses M (move to) for the first point, L (line to) for subsequent points, and Z to close.
 */
function rebuildPath(points: Point[]): string {
    if (points.length === 0) return ''

    const parts = [`M ${points[0].x} ${points[0].y}`]
    for (let i = 1; i < points.length; i++) {
        parts.push(`L ${points[i].x} ${points[i].y}`)
    }
    parts.push('Z')

    return parts.join(' ')
}

/**
 * Optimize an SVG path by reducing the number of points using the
 * Ramer-Douglas-Peucker algorithm.
 *
 * @param path - SVG path string
 * @param epsilon - Tolerance in px. Higher = more simplification. Default: 1
 * @returns Simplified SVG path string
 */
export function optimizePath(path: string, epsilon: number = 1): string {
    if (epsilon <= 0) return path

    const points = extractPoints(path)
    if (points.length <= 2) return path

    const simplified = rdpSimplify(points, epsilon)
    return rebuildPath(simplified)
}
