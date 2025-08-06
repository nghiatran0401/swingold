import * as api from "../api";

global.fetch = jest.fn();

describe("API Functions", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  describe("loginUser", () => {
    test("successful login", async () => {
      const mockUser = { id: 1, username: "testuser" };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await api.loginUser("testuser", "password");

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_BASE_URL}/login`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "testuser", password: "password" }),
        })
      );
      expect(result).toEqual(mockUser);
      expect(localStorage.getItem("user")).toBe(JSON.stringify(mockUser));
    });

    test("failed login", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Invalid credentials" }),
      });

      await expect(api.loginUser("testuser", "wrongpass")).rejects.toThrow("Invalid credentials");
    });
  });

  describe("fetchEvents", () => {
    test("successful fetch", async () => {
      const mockEvents = [{ id: 1, name: "Test Event" }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      });

      const result = await api.fetchEvents();

      expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/events`);
      expect(result).toEqual(mockEvents);
    });

    test("failed fetch", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(api.fetchEvents()).rejects.toThrow("Failed to fetch events");
    });
  });

  describe("fetchItems", () => {
    test("successful fetch", async () => {
      const mockItems = [{ id: 1, name: "Test Item" }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      });

      const result = await api.fetchItems();

      expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/items/`);
      expect(result).toEqual(mockItems);
    });
  });

  describe("createEvent", () => {
    test("successful creation", async () => {
      const mockEvent = { id: 1, name: "New Event" };
      const eventData = { name: "New Event", start_datetime: "2025-12-01T10:00:00" };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      });

      const result = await api.createEvent(eventData, 1);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_BASE_URL}/events`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": 1,
          },
          body: JSON.stringify(eventData),
        })
      );
      expect(result).toEqual(mockEvent);
    });
  });

  describe("fetchUserBalance", () => {
    test("successful balance fetch", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ balance: "1000000000000000000" }),
      });

      const result = await api.fetchUserBalance("0x1234");

      expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/transactions/onchain/balance/0x1234`);
      expect(result).toBe("1000000000000000000");
    });

    test("throws error when no wallet address", async () => {
      await expect(api.fetchUserBalance()).rejects.toThrow("No wallet address provided");
    });
  });
});
