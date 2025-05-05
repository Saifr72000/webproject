import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../utils/jwt.util";

describe("JWT utility functions", () => {
  const testUserId = "user123";

  it("should generate a valid access token and verify it", () => {
    const token = generateAccessToken(testUserId);
    const decoded = verifyAccessToken(token);

    expect(decoded).toHaveProperty("userId", testUserId); //userId should be same as the one we passed in
    expect(decoded).toHaveProperty("exp"); //expires in 15minutes
    expect(decoded).toHaveProperty("iat"); //issued at time
  });

  it("should generate a valid refresh token and verity it", () => {
    const token = generateRefreshToken(testUserId); //  generate a refresh token
    const decoded = verifyRefreshToken(token); //verify the refresh token

    expect(decoded).toHaveProperty("userId", testUserId); //userId should be same as the one we passed in
    expect(decoded).toHaveProperty("exp"); //expires in 7days
    expect(decoded).toHaveProperty("iat"); //issued at time
  });

  it("should throw an error for an invalid access token", () => {
    expect(() => verifyAccessToken("invalid.token.here")).toThrow(); //verifyAccessToken should throw an error for invalid token
  });

  it("should throw if verifying an invalid refresh token", () => {
    expect(() => verifyRefreshToken("bad.token.string")).toThrow(); //verifyRefreshToken should throw an error for invalid token
  });
});
