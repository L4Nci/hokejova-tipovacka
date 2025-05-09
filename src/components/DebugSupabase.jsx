import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function DebugSupabase() {
  useEffect(() => {
    const checkTips = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Uživatel:", user?.id);

      const { data, error } = await supabase
        .from("tournament_winner_tips")
        .select("*");

      console.log("Tips data:", data);
      console.log("Tips chyba:", error);

      // Test konkrétního dotazu s user_id
      if (user) {
        const { data: userTips, error: userError } = await supabase
          .from("tournament_winner_tips")
          .select("*")
          .eq("user_id", user.id);

        console.log("User specific tips:", userTips);
        console.log("User specific error:", userError);
      }
    };

    checkTips();
  }, []);

  return (
    <div className="bg-yellow-100 p-4 mb-4 rounded">
      Debug běží... sleduj konzoli (F12)
    </div>
  );
}
