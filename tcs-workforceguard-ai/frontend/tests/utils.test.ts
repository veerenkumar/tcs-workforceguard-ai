import { describe, it, expect } from "vitest";
import { formatINR, formatPercent, cn } from "../src/lib/utils";

describe("Frontend Utility Functions", () => {
  it("formats INR values into Lakhs and Crores accurately", () => {
    expect(formatINR(1200000)).toBe("₹12.0 Lakhs");
    expect(formatINR(25000000)).toBe("₹2.50 Cr");
    expect(formatINR(45000)).toBe("₹45,000");
  });

  it("formats percentages with 1 decimal precision", () => {
    expect(formatPercent(26.3333)).toBe("26.3%");
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("merges Tailwind classes without conflicts", () => {
    const result = cn("p-4 bg-sky-500", "p-6 text-white");
    expect(result).toContain("p-6");
    expect(result).not.toContain("p-4");
    expect(result).toContain("bg-sky-500");
  });
});
