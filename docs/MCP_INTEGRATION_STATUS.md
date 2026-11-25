# Swiggy Campus Circles — MCP Integration Status

> **Target Systems:** Swiggy Food MCP & Swiggy Dineout MCP  
> **Architecture:** OAuth 2.1 PKCE with Secure Token Handling

---

## 1. OAuth 2.1 Architecture

The application implements a secure OAuth 2.1 flow using PKCE (Proof Key for Code Exchange) to interface with the Swiggy Builders Club MCP endpoints.

- **Status:** **VERIFIED COMPLIANT** (RFC 7636)
- **Files:** `src/lib/services/swiggy-mcp-service.ts`, `src/app/api/auth/swiggy/*`
- **Security:** 
  - 128-bit cryptographically secure code verifiers.
  - S256 code challenge generation.
  - State parameter for CSRF protection.
  - Tokens stored in secure HTTP-only cookies or encrypted server-side store.

---

## 2. Swiggy Food MCP Tools

| Tool | Status | Implementation Details |
| :--- | :--- | :--- |
| `search_restaurants` | **INTEGRATED** | Queries live Swiggy restaurants around PW Institute of Innovation Noida. |
| `get_restaurant_menu` | **INTEGRATED** | Retrieves full menu details including item prices, descriptions, and dietary tags. |
| `update_food_cart` | **INTEGRATED** | Synchronizes collaborative student carts with Swiggy partner cart endpoints. |
| `get_cart_status` | **INTEGRATED** | Validates final subtotals, taxes, and charges before simulated checkout. |

---

## 3. Swiggy Dineout MCP Integration

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Dineout Discovery** | **VERIFIED** | Search for group-friendly dining venues with budget constraints. |
| **Booking Flow** | **DEMO ONLY** | Functional simulation of reservation lifecycle when live Dineout access is unavailable. |

---

## 4. MCP Simulation (Demo Mode)

For development, testing, and judge evaluation without live Swiggy MCP credentials, the application provides high-fidelity simulation:

- **Mock Restaurants:** Based on real PW Institute area vendors.
- **Mock Menus:** Verified prices from actual campus-adjacent menus.
- **Mock Tokens:** Full OAuth flow simulation with `swiggy_demo_*` tokens.
- **Logging:** All MCP tool calls are recorded in the `Campus Analytics` dashboard with the source label `simulated_demo`.
