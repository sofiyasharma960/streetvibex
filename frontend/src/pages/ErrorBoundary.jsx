import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
          <p className="text-[9px] tracking-[1em] text-[#00FFFF]/30 mb-4 uppercase">
            Something broke
          </p>
          <h1
            className="text-6xl font-black text-[#00FFFF] mb-4"
            style={{ textShadow: "0 0 20px rgba(0,255,255,0.4)" }}
          >
            OOPS
          </h1>
          <p className="text-white/30 text-sm mb-2">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <p className="text-white/15 text-xs tracking-widest mb-10">
            Try refreshing the page.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
            className="border border-[#00FFFF] text-[#00FFFF] px-10 py-4 text-[10px] tracking-[0.4em] hover:bg-[#00FFFF] hover:text-black transition-colors font-black"
          >
            BACK TO SHOP →
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}