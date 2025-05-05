import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Card from "../../components/Card/Card";

// Custom render function that includes Router
function renderWithRouter(ui, { route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);
  return render(ui, { wrapper: BrowserRouter });
}

// Helper function to render the Card component with Router context
const renderCard = (props) => {
  return render(
    <BrowserRouter>
      <Card {...props} />
    </BrowserRouter>
  );
};

describe("Card Component", () => {
  const defaultProps = {
    title: "Test Study",
    imageSrc: "/test-image.jpg",
    description: "This is a test description",
    author: "Test Author",
    studyId: "123",
  };

  test("renders card with title, image, description and author", () => {
    renderCard(defaultProps);

    // Check if all the content is rendered correctly
    expect(screen.getByText("Test Study")).toBeInTheDocument();
    expect(screen.getByText("This is a test description")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();

    // Check if image is rendered with correct attributes
    const image = screen.getByAltText("Test Study");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-image.jpg");
  });

  test("does not render View Study button when participate is false", () => {
    renderCard({ ...defaultProps, participate: false });

    // Button should not be in the document
    expect(screen.queryByText("View Study")).not.toBeInTheDocument();
  });

  test("renders View Study button when participate is true", () => {
    renderCard({ ...defaultProps, participate: true });

    // Button should be in the document
    const button = screen.getByText("View Study");
    expect(button).toBeInTheDocument();

    // Button should be wrapped in a Link with correct path
    const linkElement = button.closest("a");
    expect(linkElement).toHaveAttribute("href", "/study/123");
  });

  test("renders with default participate value (false) when not provided", () => {
    // Omit the participate prop
    const { participate, ...propsWithoutParticipate } = defaultProps;
    renderCard(propsWithoutParticipate);

    // Button should not be in the document
    expect(screen.queryByText("View Study")).not.toBeInTheDocument();
  });

  test("renders card component", () => {
    renderWithRouter(<Card title="Test Card" />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    // other assertions...
  });
});
