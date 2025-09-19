// import { useQuery } from "@tanstack/react-query";
// import { GamePayload } from "../types/socket";

// /**
//  * A hook to access the current game state from the React Query cache.
//  * This hook subscribes to the 'game' query key.
//  * The data is pushed into the cache by the WebSocket handler.
//  */
// export function useGame() {
//   const { data } = useQuery<GamePayload | undefined>({ // Allow data to be undefined
//     queryKey: ["game"],
//     // Provide a dummy queryFn to prevent React Query from throwing an error.
//     // This will only run if the query is ever triggered to fetch, which we prevent.
//     queryFn: () => Promise.resolve(undefined),
//     // The data is managed by the WebSocket. We don't need to fetch.
//     staleTime: Infinity, // Prevents automatic refetching
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//   });
//   return data;
// }
