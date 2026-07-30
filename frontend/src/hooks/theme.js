import { useEffect, useState } from "react";

export default function useTheme() {

    const getInitialTheme = () => {

        const saved = localStorage.getItem("theme");

        if (saved) return saved;

        return "system";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {

        const html = document.documentElement;

        if (theme === "dark") {

            html.classList.add("dark");

        }

        else if (theme === "light") {

            html.classList.remove("dark");

        }

        else {

            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

            html.classList.toggle("dark", prefersDark);

        }

        localStorage.setItem("theme", theme);

    }, [theme]);

    return {
        theme,
        setTheme
    };

}