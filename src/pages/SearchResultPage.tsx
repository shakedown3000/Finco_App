import { useState, useEffect } from "react";
import supabaseClient from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import { Transactions } from "../types/supabase-types.own";
import Logo from "../components/Logo";
import categoryIcons from "../assets/categoryIcons";
import { useUserContext } from "../context/UserContext";

const SearchResultPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Transactions[]>([]);
  const userContext = useUserContext();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userContext.user) return;

      const profileResponse = await supabaseClient
        .from("profiles")
        .select(
          "id, card_number, first_name, last_name, avatar_url, created_at"
        )
        .eq("id", userContext.user.id)
        .single();

      if (profileResponse.error) {
        console.error("Error fetching profile data:", profileResponse.error);
      } else {
        const profileData = profileResponse.data;

        const formattedProfile = {
          ...profileData,
          created_at: profileData.created_at,
        };

        userContext.setProfile(formattedProfile);
      }
    };

    fetchProfileData();
  }, [userContext]);

  const fetchSearchResults = async (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabaseClient
      .from("transactions")
      .select("*")
      .ilike("name", `${term}%`);

    if (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } else {
      setSearchResults(data);
    }
  };

  const fetchCategoryResults = async (category: string) => {
    if (!category) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("category", category);

    if (error) {
      console.error("Error fetching category results:", error);
      setSearchResults([]);
    } else {
      setSearchResults(data);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchSearchResults(term);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategoryFilter(selectedCategory);
    fetchCategoryResults(selectedCategory);
  };

  return (
    <div className="flex items-center justify-center">
      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <div className="flex justify-between items-center mb-10 w-full">
          <Logo />
          {userContext?.profile?.avatar_url ? (
            <img
              alt="User Avatar"
              src={userContext.profile.avatar_url}
              className="inline-block h-14 w-14 rounded-full cursor-pointer object-cover object-center"
            />
          ) : (
            <div className="inline-block h-14 w-14 rounded-full bg-gray-300 flex items-center justify-center">
              No image
            </div>
          )}
        </div>
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search Transactions..."
            className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-300"
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
        </div>

        <div className="mb-5 custom-select">
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border border-gray rounded-md bg-lightgray mb-6 mt-4"
          >
            <option value="">Select Category</option>
            <option value="Food & Drink">Food & Drink</option>
            <option value="Salary">Salary</option>
            <option value="Insurance">Insurance</option>
            <option value="Clothing & Accessories">
              Clothing & Accessories
            </option>
            <option value="Entertainment & Leisure">
              Entertainment & Leisure
            </option>
            <option value="Travel & Vacation">Travel & Vacation</option>
            <option value="Utilities (Electricity, Water, Gas)">
              Utilities (Electricity, Water, Gas)
            </option>
            <option value="Rent/Mortgage">Rent/Mortgage</option>
            <option value="Healthcare & Medical Expenses">
              Healthcare & Medical Expenses
            </option>
            <option value="Dining Out & Takeaway">Dining Out & Takeaway</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          {searchResults.length > 0 ? (
            searchResults.map((transaction) => (
              <div
                className="flex justify-between gap-4 items-start mb-4 border-b border-gray-200 pb-6"
                key={transaction.id}
              >
                <div className="text-lg rounded-full p-2 bg-gray w-12 h-12 flex items-center justify-center">
                  {categoryIcons[transaction.category] || "🛒"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-tBase text-left">
                    {transaction.name}
                  </div>
                  <div className="text-small text-tBase text-left">
                    {new Date(
                      transaction.transaction_date
                    ).toLocaleDateString()}
                  </div>
                </div>

                <div
                  className={`font-bold ${
                    transaction.income_expenses === "income"
                      ? "text-[#1e78fe]"
                      : "text-[#FF9900]"
                  }`}
                >
                  {transaction.income_expenses === "expense" ? "-" : "+"}
                  {Math.abs(transaction.amount).toFixed(2)} €
                </div>
              </div>
            ))
          ) : (
            <p>No transactions found.</p>
          )}
        </div>
      </section>
      <Navbar />
    </div>
  );
};

export default SearchResultPage;
