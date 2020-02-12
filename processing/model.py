import pandas as pd
import numpy as np
from scipy.sparse.linalg import svds
import scipy.sparse as sps

def getSparseSVD(ratings_centered_matrix, K):
    '''
    ratings_centered_matrix
    # Compute the largest k singular values/vectors for a sparse matrix.
    # k : int, optional
    # Number of singular values and vectors to compute. Must be 1 <= k < min(A.shape)
    
    Returns
    u : ndarray, shape=(M, k) Unitary matrix having left singular vectors as columns 
    sigma : ndarray, shape=(k,k) Diagonal singular values.
    vt : ndarray, shape=(k, N)Unitary matrix having right singular vectors as rows
    '''

    u, s, vt = svds(ratings_centered_matrix, k=K)
    # get it back in k diagongal format for matrix multiplication
    sigma = np.diag(s)
    return u, sigma, vt

def getRecommendedMovies(inputdf, userId=0, limit=5):
    # saving movies list with original order and items rated already by user
    movies = inputdf['movieId'].unique()
    seen = list(inputdf[inputdf['userId'] == userId]['movieId'])
    # fixing index to be multilevel with userId and movieId
    inputdf.set_index(['userId', 'movieId'], inplace=True)
    inputdf = inputdf.astype('float64')

    # create new ratings_matrix
    ratings_matrix_plus = sps.csr_matrix((
        inputdf['rating'],
        (inputdf.index.codes[0], inputdf.index.codes[1])
        )).todense()

    user_ratings_mean = np.mean(ratings_matrix_plus, axis = 1)
    ratings_matrix_centered = ratings_matrix_plus - user_ratings_mean.reshape(-1, 1)

    Ua, sigma, Vt = getSparseSVD(ratings_matrix_centered, K=50)
    all_user_predicted_ratings = np.dot(np.dot(Ua, sigma), Vt) + user_ratings_mean.reshape(-1, 1)

    # predictions are based on row/col ids, not original ids
    predictions_df = pd.DataFrame(all_user_predicted_ratings)
    # Get and sort the user's predictions
    sorted_user_predictions = predictions_df.iloc[userId].sort_values(ascending=False)
    # Getting moviesId that were not seen already
    res = [movies[rowid] for rowid in sorted_user_predictions.keys() if movies[rowid] not in seen]
    return res[:limit]
