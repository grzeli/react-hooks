import React, { useReducer, useCallback, useEffect } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error("shouldnt get here!");
  }
};

const httpReducer = (httpState, action) => {
  switch (action.type) {
    case "SEND":
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...httpState, loading: false };
    case "ERROR":
      return { loading: false, error: action.error };
    case "CLEAR":
      return { ...httpState, error: null };
    default:
      throw new Error('shuoldn"t be here!');
  }
};

const Ingredients = () => {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null
  });
  // const [ingredients, setIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  const filteredIngredients = useCallback(filteredIngredients => {
    // setIngredients(filteredIngredients);
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  useEffect(() => {
    console.log("rerendering ingredients", ingredients);
  }, [ingredients]);

  const addIngredientHandler = ingredient => {
    dispatchHttp({ type: "SEND" });
    fetch("https://hooks-cb127.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        dispatchHttp({ type: "RESPONSE" });
        return response.json();
      })
      .then(responseData => {
        console.log("response", responseData);
        // setIngredients(prevIngredients => [...prevIngredients, { id: responseData.name, ...ingredient}]);
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient }
        });
      })
      .catch(error => {
        dispatchHttp({ type: "ERROR", error: error.message });
      });
  };

  const removeIngredientHandler = ingredientId => {
    dispatchHttp({ type: "SEND" });
    fetch(
      `https://hooks-cb127.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE"
      }
    )
      .then(response => {
        dispatchHttp({ type: "RESPONSE" });
        // setIngredients(prevIngredients => prevIngredients.filter((ingredient) => ingredient.id !== ingredientId));
        dispatch({ type: "DELETE", id: ingredientId });
      })
      .catch(error => {
        dispatchHttp({ type: "ERROR", error: error.message });
      });
  };

  const ClearError = () => {
    dispatchHttp({ type: "CLEAR" });
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={ClearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredients} />
        <IngredientList
          ingredients={ingredients}
          onRemoveItem={removeIngredientHandler}
        />
        {/* Need to add list here! */}
      </section>
    </div>
  );
};

export default Ingredients;
