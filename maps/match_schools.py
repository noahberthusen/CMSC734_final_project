import pandas as pd
import numpy as np
import os
from bs4 import BeautifulSoup
import requests
import re


df = pd.read_csv('phd_stipends.txt')
df.dropna(subset=["University"], inplace=True)
df.replace(to_replace={" - ":"-", "&amp;":"&", "\(.*\)":""}, inplace=True, regex=True)
df["University"] = df["University"].str.strip()

all_unis_df = pd.read_csv('all_unis.csv')

uni_to_all_uni = []
for uni1 in df["University"].unique():
    tmp_arr = []
    for uni2 in all_unis_df["Name"].unique():
        if uni1 in uni2:
            tmp_arr.append(uni2)
    
    if (len(tmp_arr) == 1):
        uni_to_all_uni.append([uni1, tmp_arr[0]])
    elif (len(tmp_arr) > 1):
        print(uni1)
        print(tmp_arr)

        ind = int(input("Enter index: "))
        uni_to_all_uni.append([uni1, tmp_arr[ind]])


uni_to_all_uni_df = pd.DataFrame(uni_to_all_uni)
uni_to_all_uni_df.to_csv("uni_to_all_uni.csv")