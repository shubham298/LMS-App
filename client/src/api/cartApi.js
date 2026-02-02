import axiosInstance from "./axiosInstance";

export const getCartApi = async () => {
    const { data } = await axiosInstance.get("/cart");
    return data;
};