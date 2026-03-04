"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        // Signal signin page to open in register mode
        sessionStorage.setItem("authMode", "register");
        router.replace("/signin");
    }, [router]);

    return null;
}
