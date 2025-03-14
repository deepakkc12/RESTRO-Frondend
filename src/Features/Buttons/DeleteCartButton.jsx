import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteCart } from "../../redux/cart/actions";
import { useToast } from "../../hooks/UseToast";

const DeleteCartButton = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast()

  const handleDeleteCart = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the cart? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
       dispatch(deleteCart());
      toast.success("Cart deleted successfully!");
    } catch (error) {
      console.error("Failed to delete cart:", error);
      toast.error("Failed to delete cart. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDeleteCart}
      className={`flex items-center justify-center  border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition-all duration-300 ${
        isDeleting ? "opacity-50 cursor-not-allowed" : ""
      }`}
      aria-label="Delete Cart"
      disabled={isDeleting}
    >
      {isDeleting ? (
        <span className="loader" aria-label="Deleting..."></span>
      ) : (
        <Trash2 />
      )}
      {/* <span className="ml-2">Delete Cart</span> */}
    </button>
  );
};

export default DeleteCartButton;
